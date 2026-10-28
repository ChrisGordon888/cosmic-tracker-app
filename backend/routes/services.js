const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { createService, authorize } = require('../lib/serviceEngagements');
const { paymentMode } = require('../lib/servicePaymentMode');
const service = createService({ Opportunity });
const router = express.Router();
const wrap = fn => async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try { await fn(req, res); } catch (error) { res.status(error.status || 503).json({ error: error.status ? error.message : 'Commercial operation unavailable. Retry safely; no payment is assumed.' }); }
};
router.post('/webhook', express.raw({ type: 'application/json', limit: '256kb' }), wrap(async (req, res) => res.json(await service.webhook(req.body, req.headers['stripe-signature']))));
router.use(express.json({ limit: '16kb' }));
router.post('/intake', wrap(async (req, res) => {
  const secret = process.env.SERVICES_INTAKE_SECRET;
  const given = String(req.headers['x-services-key'] || '');
  if (!secret || secret.length < 32 || given.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret))) return res.status(403).json({ error: 'Server intake authorization required.' });
  await Opportunity.init(); // Require the unique inquiry/session indexes before accepting durable intake.
  const record = await service.intake(req.body);
  if (req.body.notification === 'accepted') await Opportunity.updateOne({ _id: record._id }, { $set: { 'engagement.notification': 'accepted' } });
  res.json({ reference: `COS-${record.engagement.inquiryId}` });
}));
router.use(wrap(async (req, res) => {
  // Authenticate independently of client IDs; never create users from this endpoint.
  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
  let user;
  try { const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET); user = await User.findOne({ email: decoded.email }); } catch { return res.status(401).json({ error: 'Sign in required.' }); }
  authorize(user, process.env.SERVICES_OPERATOR_ID);
  if (req.method === 'GET' && req.path === '/') {
    let schedulingUrl = null;
    try { const url = new URL(process.env.SERVICES_SCHEDULING_URL); if (url.protocol === 'https:') schedulingUrl = url.href; } catch { /* optional */ }
    const mode = paymentMode(process.env);
    const scope = mode.live ? { 'engagement.paymentMode': 'live', 'engagement.paymentAccount': mode.account, 'engagement.paymentEnvironment': mode.environment } : { $or: [{ 'engagement.paymentMode': mode.mode }, ...(mode.mode === 'test' ? [{ 'engagement.paymentMode': { $exists: false } }] : [])] };
    return res.json({ records: await Opportunity.find({ ...scope, ownerId: process.env.SERVICES_OPERATOR_ID, 'engagement.inquiryId': { $exists: true } }).sort({ createdAt: -1 }).limit(100), paymentMode: mode.mode, testMode: !mode.live, stripeConfigured: mode.enabled && (mode.live ? /^sk_live_/ : /^sk_test_/).test(mode.key || ''), schedulingUrl });
  }
  const match = /^\/([a-f\d]{24})\/(approve|checkout|reconcile|follow-up)$/.exec(req.path);
  if (req.method !== 'POST' || !match) return res.status(404).json({ error: 'Unknown engagement action.' });
  await service.get(match[1]);
  const method = { approve: 'approve', checkout: 'checkout', reconcile: 'reconcile', 'follow-up': 'followUp' }[match[2]];
  res.json(await service[method](match[1], req.body));
}));
module.exports = router;
