const crypto = require('node:crypto');
const offers = ['not-sure', 'creative-direction-session', 'song-project-development-pack', 'music-daw-workflow-lesson', 'artist-world-audit'];
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function text(value, max, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail('Invalid engagement details.');
  return value.trim();
}
function authorize(user, ownerId) {
  if (!ownerId) fail('Commercial operations are not configured.', 503);
  if (!user || String(user._id || user.id) !== ownerId || user.creatorStatus === 'suspended' || !(['owner', 'admin'].includes(user.role) || (user.role === 'creator' && user.creatorStatus === 'active'))) fail('Commercial operator access required.', 403);
}
function signature(raw, header, secret, now = Date.now()) {
  if (!secret) fail('Webhook is not configured.', 503);
  const parts = String(header || '').split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300) fail('Invalid webhook signature.', 400);
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.`).update(raw).digest('hex');
  if (!parts.some(p => p.startsWith('v1=') && /^[a-f0-9]{64}$/.test(p.slice(3)) && crypto.timingSafeEqual(Buffer.from(p.slice(3), 'hex'), Buffer.from(expected, 'hex')))) fail('Invalid webhook signature.', 400);
  return JSON.parse(raw.toString('utf8'));
}
function createService({ Opportunity, env = process.env, transport = fetch }) {
  const owner = () => env.SERVICES_OPERATOR_ID;
  async function stripe(path, body, key) {
    // Deliberately test-only until a separate live-readiness acceptance.
    if (!/^sk_test_/.test(env.STRIPE_SECRET_KEY || '')) fail('Stripe test mode is not configured; live keys are disabled.', 503);
    const response = await transport(`https://api.stripe.com/v1/${path}`, {
      method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Stripe-Version': '2025-03-31.basil', ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': key } : {}) },
      ...(body ? { body: new URLSearchParams(body).toString() } : {}), signal: AbortSignal.timeout(12000),
    });
    const result = await response.json();
    if (!response.ok) fail('Stripe request failed. Retry or reconcile; no payment is assumed.', 502);
    return result;
  }
  async function get(id) {
    if (!/^[a-f\d]{24}$/i.test(id)) fail('Engagement not found.', 404);
    const record = await Opportunity.findOne({ _id: id, ownerId: owner(), 'engagement.inquiryId': { $exists: true } });
    if (!record) fail('Engagement not found.', 404);
    return record;
  }
  async function intake(input) {
    if (!owner()) fail('Commercial operations are not configured.', 503);
    const inquiryId = text(input.inquiryId, 36);
    if (!/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(inquiryId)) fail('Invalid inquiry reference.');
    const name = text(input.name, 150), email = text(input.email, 254).toLowerCase(), offer = text(input.offer, 80);
    if (!offers.includes(offer) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Invalid inquiry.');
    const context = text(input.message, 6000), links = text(input.links || '', 3000, false), timeline = text(input.timeline || '', 300, false);
    const fingerprint = crypto.createHash('sha256').update(JSON.stringify({ name, email, offer, context, links, timeline })).digest('hex');
    const query = { ownerId: owner(), 'engagement.inquiryId': inquiryId };
    let record;
    try { record = await Opportunity.findOneAndUpdate(query, { $setOnInsert: {
      ownerId: owner(), title: `${name} · ${offer}`.slice(0, 160), desiredOutcome: 'Agree a useful creative engagement', context: context.slice(0, 5000), nextAction: 'Review inquiry and reply with fit, scope and timing',
      engagement: { inquiryId, fingerprint, name, email, offer, context, links, timeline, approval: 'inquiry', paymentStatus: 'not-requested', scheduling: 'not-arranged', delivery: 'not-started', notification: 'pending', revision: 0 },
    } }, { upsert: true, new: true, runValidators: true }); }
    catch (error) { if (error.code !== 11000) throw error; record = await Opportunity.findOne(query); }
    if (record.engagement.fingerprint !== fingerprint) fail('This inquiry reference already has different details. Start a new inquiry.', 409);
    return record;
  }
  async function approve(id, input) {
    const scope = text(input.scope, 3000), agreement = text(input.agreement, 1000);
    if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 50 || input.amountCents > 1000000) fail('Enter the agreed USD amount in cents (50–1000000).');
    const record = await Opportunity.findOneAndUpdate({ _id: id, ownerId: owner(), 'engagement.approval': 'inquiry' }, { $set: { 'engagement.approval': 'approved', 'engagement.scope': scope, 'engagement.agreement': agreement, 'engagement.amountCents': input.amountCents, 'engagement.approvedAt': new Date(), nextAction: 'Create and share the approved test payment link' } }, { new: true, runValidators: true });
    if (!record) fail('Approval already recorded or engagement unavailable. Approved quotes are locked.', 409);
    return record;
  }
  async function checkout(id) {
    let record = await get(id), e = record.engagement;
    if (e.approval !== 'approved') fail('Record the client scope agreement before payment.');
    if (e.sessionId) return reconcile(id);
    if (!/^sk_test_/.test(env.STRIPE_SECRET_KEY || '')) fail('Stripe test mode is not configured; live keys are disabled.', 503);
    const origin = new URL(env.SERVICES_PUBLIC_URL || '');
    if (origin.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(origin.hostname)) fail('Configure a secure Services public URL.', 503);
    if (!e.attemptAt) record = await Opportunity.findOneAndUpdate({ _id: id, ownerId: owner(), 'engagement.attemptAt': null }, { $set: { 'engagement.attemptAt': new Date() } }, { new: true }) || await get(id);
    e = record.engagement;
    // Never recreate a potentially charged session after Stripe's idempotency retention window.
    if (Date.now() - new Date(e.attemptAt).getTime() > 23 * 3600000) fail('Payment creation requires operator reconciliation in Stripe; do not create another charge.', 409);
    const session = await stripe('checkout/sessions', {
      mode: 'payment', customer_email: e.email, 'payment_method_types[0]': 'card', 'invoice_creation[enabled]': 'true',
      client_reference_id: id, 'metadata[engagementId]': id, 'payment_intent_data[metadata][engagementId]': id,
      'line_items[0][price_data][currency]': 'usd', 'line_items[0][price_data][unit_amount]': String(e.amountCents),
      'line_items[0][price_data][product_data][name]': 'COSMIC creative service',
      'line_items[0][price_data][product_data][description]': e.scope, 'line_items[0][quantity]': '1',
      success_url: new URL('/services/payment-return', origin).href, cancel_url: new URL('/services', origin).href,
    }, `cosmic-service-${id}`);
    if (session.livemode !== false || !/^cs_test_/.test(session.id) || !session.url?.startsWith('https://checkout.stripe.com/')) fail('Unexpected Stripe session.', 502);
    await Opportunity.updateOne({ _id: id, ownerId: owner(), 'engagement.sessionId': null }, { $set: { 'engagement.sessionId': session.id, 'engagement.checkoutUrl': session.url, 'engagement.paymentStatus': 'unpaid' } });
    return reconcile(id);
  }
  async function reconcile(id) {
    const record = await get(id), e = record.engagement;
    if (!e.sessionId) fail('No payment session is linked.');
    const s = await stripe(`checkout/sessions/${encodeURIComponent(e.sessionId)}?expand[]=payment_intent.latest_charge`);
    if (s.id !== e.sessionId || s.livemode !== false || s.client_reference_id !== id || s.metadata?.engagementId !== id || s.currency !== 'usd' || s.amount_total !== e.amountCents) fail('Stripe reference or quote mismatch; manual review required.', 409);
    const pi = s.payment_intent, charge = pi?.latest_charge;
    let status = s.status === 'expired' ? 'expired' : 'unpaid';
    if (s.payment_status === 'paid') {
      if (pi?.status !== 'succeeded' || pi.amount_received !== e.amountCents || !charge?.paid) fail('Payment evidence is incomplete; retry reconciliation.', 409);
      status = charge.disputed ? 'disputed' : charge.amount_refunded > 0 ? 'refunded-or-partial' : 'paid';
    }
    // Optimistic compare prevents an older in-flight retrieval overwriting a newer reconciliation.
    const filter = { _id: id, ownerId: owner(), 'engagement.sessionId': e.sessionId, 'engagement.revision': e.revision };
    const update = await Opportunity.updateOne(filter, { $set: { 'engagement.revision': e.revision + 1, 'engagement.paymentStatus': status, 'engagement.paymentIntentId': pi?.id || null, 'engagement.invoiceId': typeof s.invoice === 'string' ? s.invoice : s.invoice?.id || null, 'engagement.checkedAt': new Date() } });
    if (!update.matchedCount) fail('Another reconciliation completed; refresh and retry.', 409);
    return get(id);
  }
  async function followUp(id, input) {
    const record = input.delivery && input.delivery !== 'not-started' ? await reconcile(id) : await get(id);
    if (record.engagement.approval !== 'approved') fail('Approve the scope first.');
    if (!['not-arranged', 'invited', 'confirmed'].includes(input.scheduling) || !['not-started', 'in-progress', 'delivered'].includes(input.delivery)) fail('Invalid follow-up state.');
    if (input.delivery !== 'not-started' && record.engagement.paymentStatus !== 'paid') fail('Verify payment before recording delivery work.');
    return Opportunity.findOneAndUpdate({ _id: id, ownerId: owner() }, { $set: { nextAction: text(input.nextAction, 500), 'engagement.scheduling': input.scheduling, 'engagement.delivery': input.delivery, 'engagement.followUpNote': text(input.note || '', 2000, false) } }, { new: true, runValidators: true });
  }
  async function webhook(raw, header) {
    const event = signature(raw, header, env.STRIPE_WEBHOOK_SECRET);
    if (event.livemode !== false) fail('Live events are disabled.');
    const object = event.data?.object;
    let record;
    if (['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'].includes(event.type)) {
      record = await Opportunity.findOne({ ownerId: owner(), 'engagement.sessionId': object?.id });
      // A webhook may arrive between session creation and local persistence: ask Stripe to retry.
      if (!record && object?.metadata?.engagementId) fail('Session persistence pending; retry.', 503);
    } else if (['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'].includes(event.type)) {
      const intent = object?.payment_intent;
      if (intent) record = await Opportunity.findOne({ ownerId: owner(), 'engagement.paymentIntentId': intent });
    }
    if (record) await reconcile(String(record._id));
    // No fulfillment side effects: repeated/out-of-order events re-read current Stripe state.
    return { received: true };
  }
  return { intake, approve, checkout, reconcile, followUp, webhook, get };
}
module.exports = { createService, authorize, signature };
