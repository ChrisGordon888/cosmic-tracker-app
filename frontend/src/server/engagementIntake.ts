import type { validateInquiry } from './servicesInquiry';
export async function persistEngagement(inquiry: ReturnType<typeof validateInquiry>, notification?: string) {
  const base = process.env.SERVICES_BACKEND_URL, key = process.env.SERVICES_INTAKE_SECRET;
  if (!base && !key) return false; // V6.1 email-only compatibility, explicitly not commercial activation.
  if (!base || !key) throw Error('Engagement intake is not configured. Your entries are still here.');
  const response = await fetch(`${base.replace(/\/$/, '')}/services/intake`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-services-key': key }, body: JSON.stringify({ ...inquiry, notification }), signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw Error('Could not confirm the engagement record. Retry unchanged; your entries are still here.');
  return true;
}
