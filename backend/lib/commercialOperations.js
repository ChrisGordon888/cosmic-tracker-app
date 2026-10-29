function summarize(records, now = Date.now()) {
  const s = { total: records.length, inquiries: 0, awaitingPayment: 0, paid: 0, upcoming: 0, awaitingDelivery: 0, attention: 0, livePaidCents: 0 };
  for (const { engagement: e } of records) {
    const paid = e.paymentStatus === 'paid' && Boolean(e.checkedAt);
    const inquiry = e.approval === 'inquiry';
    const awaitingPayment = e.approval === 'approved' && !paid;
    const delivery = paid && e.delivery !== 'delivered';
    s.inquiries += Number(inquiry); s.awaitingPayment += Number(awaitingPayment);
    s.paid += Number(paid); s.awaitingDelivery += Number(delivery);
    s.upcoming += Number(e.scheduling === 'confirmed' && new Date(e.sessionAt).getTime() > now);
    s.attention += Number(inquiry || awaitingPayment || delivery || e.notification !== 'accepted');
    if (paid && e.paymentMode === 'live' && e.paymentAccount && e.paymentEnvironment && Number.isSafeInteger(e.amountCents)) s.livePaidCents += e.amountCents;
  }
  return s;
}
function booking(input, e, now = Date.now()) {
  const allowed = ['not-arranged','invited','confirmed','cancelled','rescheduling'];
  if (!allowed.includes(input.scheduling)) throw Error('Invalid scheduling state.');
  const hasDetails = input.sessionAt !== undefined;
  if (!hasDetails) return {}; // Legacy follow-up clients retain existing booking data.
  const date = input.sessionAt ? new Date(input.sessionAt) : null;
  const zone = String(input.sessionTimeZone || '').trim();
  if (date && (!Number.isFinite(date.getTime()) || !zone)) throw Error('Enter a valid session time and time zone.');
  if (zone) { try { new Intl.DateTimeFormat('en-US',{timeZone:zone}); } catch { throw Error('Use a valid IANA time zone.'); } }
  if (input.scheduling === 'confirmed' && !date) throw Error('Record the confirmed session date and time.');
  if (input.scheduling === 'confirmed' && date.getTime() <= now && new Date(e.sessionAt).getTime() !== date.getTime()) throw Error('Confirm a future session time.');
  if (['not-arranged','invited','rescheduling','cancelled'].includes(input.scheduling) && date) throw Error('Clear the confirmed time for this scheduling state.');
  const meetingUrl = String(input.meetingUrl || '').trim();
  if (meetingUrl) { let u; try { u = new URL(meetingUrl); } catch { throw Error('Use an HTTPS meeting link.'); } if(u.protocol !== 'https:' || u.username || u.password || meetingUrl.length>1000) throw Error('Use an HTTPS meeting link.'); }
  const reference = String(input.bookingReference || '').trim();
  if (reference.length > 300) throw Error('Booking reference is too long.');
  return { 'engagement.sessionAt':date, 'engagement.sessionTimeZone':zone, 'engagement.bookingReference':reference, 'engagement.meetingUrl':meetingUrl };
}
module.exports = { summarize, booking };
