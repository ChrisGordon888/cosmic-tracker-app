const { paymentMode } = require('./servicePaymentMode');
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
  try { return JSON.parse(raw.toString('utf8')); } catch { fail('Invalid webhook payload.', 400); }
}
function createService({ Opportunity, env = process.env, transport = fetch }) {
  const owner = () => env.SERVICES_OPERATOR_ID;
  function config() {
    try { const c = paymentMode(env); if (c.live && Opportunity.db?.name !== c.database) throw Error(); return c; } catch { fail('Payment environment is not configured.', 503); }
  }
  function binding(record) {
    const c = config(), e = record.engagement;
    if ((e.paymentMode || 'test') !== c.mode || (c.live && (e.paymentAccount !== c.account || e.paymentEnvironment !== c.environment))) fail('Payment environment mismatch.', 409);
    return c;
  }
  async function stripe(path, body, key) {
    const c = config();
    if (!c.enabled || !(c.live ? /^sk_live_/ : /^sk_test_/).test(c.key || '')) fail('Stripe payment mode is not configured.', 503);
    if (c.live) {
      const check = await transport('https://api.stripe.com/v1/account', { headers: { Authorization: `Bearer ${c.key}` }, signal: AbortSignal.timeout(12000) });
      const account = await check.json();
      if (!check.ok || account.id !== c.account) fail('Stripe account mismatch.', 503);
    }
    const response = await transport(`https://api.stripe.com/v1/${path}`, {
      method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${c.key}`, 'Stripe-Version': '2025-03-31.basil', ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': key } : {}) },
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
    binding(record);
    return record;
  }
  async function intake(input) {
    if (!owner()) fail('Commercial operations are not configured.', 503);
    const c = config();
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
      engagement: { paymentMode: c.mode, paymentAccount: c.account, paymentEnvironment: c.environment, inquiryId, fingerprint, name, email, offer, context, links, timeline, approval: 'inquiry', paymentStatus: 'not-requested', scheduling: 'not-arranged', delivery: 'not-started', notification: 'pending', revision: 0 },
    } }, { upsert: true, new: true, runValidators: true }); }
    catch (error) { if (error.code !== 11000) throw error; record = await Opportunity.findOne(query); }
    binding(record);
    if (record.engagement.fingerprint !== fingerprint) fail('This inquiry reference already has different details. Start a new inquiry.', 409);
    return record;
  }
  async function approve(id, input) {
    await get(id);
    const scope = text(input.scope, 3000), agreement = text(input.agreement, 1000);
    if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 50 || input.amountCents > 1000000) fail('Enter the agreed USD amount in cents (50–1000000).');
    const record = await Opportunity.findOneAndUpdate({ _id: id, ownerId: owner(), 'engagement.approval': 'inquiry' }, { $set: { 'engagement.approval': 'approved', 'engagement.scope': scope, 'engagement.agreement': agreement, 'engagement.amountCents': input.amountCents, 'engagement.approvedAt': new Date(), nextAction: 'Create and share the approved payment link' } }, { new: true, runValidators: true });
    if (!record) fail('Approval already recorded or engagement unavailable. Approved quotes are locked.', 409);
    return record;
  }
  async function checkout(id) {
    let record = await get(id), e = record.engagement;
    if (e.approval !== 'approved') fail('Record the client scope agreement before payment.');
    if (e.sessionId) return reconcile(id);
    const c = binding(record);
    if (!c.enabled || !(c.live ? /^sk_live_/ : /^sk_test_/).test(c.key || '')) fail('Stripe payment mode is not configured.', 503);
    const origin = new URL(env.SERVICES_PUBLIC_URL || '');
    if (origin.protocol !== 'https:' && (c.live || !['localhost', '127.0.0.1'].includes(origin.hostname))) fail('Configure a secure Services public URL.', 503);
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
    }, c.live ? `cosmic-service-live-${c.environment}-${id}` : `cosmic-service-${id}`);
    if (session.livemode !== c.live || !(c.live ? /^cs_live_/ : /^cs_test_/).test(session.id) || !session.url?.startsWith('https://checkout.stripe.com/')) fail('Unexpected Stripe session.', 502);
    await Opportunity.updateOne({ _id: id, ownerId: owner(), 'engagement.sessionId': null }, { $set: { 'engagement.sessionId': session.id, 'engagement.checkoutUrl': session.url, 'engagement.paymentStatus': 'unpaid' } });
    return reconcile(id);
  }
  async function reconcile(id) {
    const record = await get(id), e = record.engagement;
    const c = binding(record);
    if (!e.sessionId) fail('No payment session is linked.');
    const s = await stripe(`checkout/sessions/${encodeURIComponent(e.sessionId)}?expand[]=payment_intent.latest_charge`);
    if (s.id !== e.sessionId || s.livemode !== c.live || s.client_reference_id !== id || s.metadata?.engagementId !== id || s.currency !== 'usd' || s.amount_total !== e.amountCents) fail('Stripe reference or quote mismatch; manual review required.', 409);
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
    if (!owner()) fail('Commercial operations are not configured.', 503);
    const c = config();
    if (!c.enabled) fail("Payments are disabled.", 503);
    const event = signature(raw, header, c.webhook);
    if (!event || typeof event !== 'object') fail('Invalid webhook payload.', 400);
    if (event.livemode !== c.live) fail('Wrong payment environment.');
    const object = event.data?.object;
    let record;
    if (['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired'].includes(event.type)) {
      if (typeof object?.id !== 'string' || !(c.live ? /^cs_live_/ : /^cs_test_/).test(object.id)) fail('Invalid Checkout reference.', 400);
      record = await Opportunity.findOne({ ownerId: owner(), 'engagement.sessionId': object.id });
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
