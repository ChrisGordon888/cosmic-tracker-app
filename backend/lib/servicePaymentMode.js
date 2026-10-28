// No key value or database target is returned to clients.
function paymentMode(env) {
  const mode = env.SERVICES_PAYMENT_MODE || 'test';
  if (!['test', 'live', 'disabled'].includes(mode)) throw Error('Invalid Services payment mode.');
  if (mode === 'disabled') return { mode, enabled: false };
  if (mode === 'test') return { mode, enabled: true, key: env.STRIPE_TEST_SECRET_KEY || env.STRIPE_SECRET_KEY, webhook: env.STRIPE_TEST_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET, live: false };
  let database;
  try { database = decodeURIComponent(new URL(env.MONGODB_URI).pathname.slice(1)); } catch { /* fail closed below */ }
  if (env.SERVICES_LIVE_ENABLED !== 'true' || !env.SERVICES_ENVIRONMENT_ID ||
      !/^acct_/.test(env.STRIPE_LIVE_ACCOUNT_ID || '') ||
      !env.SERVICES_TEST_DATABASE_NAME || !env.SERVICES_LIVE_DATABASE_NAME ||
      database !== env.SERVICES_LIVE_DATABASE_NAME || database === env.SERVICES_TEST_DATABASE_NAME) {
    throw Error('Live Services isolation and activation are not configured.');
  }
  return { mode, enabled: true, live: true, key: env.STRIPE_LIVE_SECRET_KEY, webhook: env.STRIPE_LIVE_WEBHOOK_SECRET,
    database, account: env.STRIPE_LIVE_ACCOUNT_ID, environment: env.SERVICES_ENVIRONMENT_ID };
}
module.exports = { paymentMode };
