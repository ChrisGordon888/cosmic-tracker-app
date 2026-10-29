const test=require('node:test'),assert=require('node:assert/strict');
const {summarize,booking}=require('../lib/commercialOperations');
test('summary uses lifecycle, excludes sandbox and unverified/refunded revenue',()=>{
 const rows=[{approval:'inquiry',notification:'pending'},{approval:'approved',paymentStatus:'unpaid',notification:'accepted'},{approval:'approved',paymentStatus:'paid',checkedAt:new Date(),paymentMode:'test',amountCents:15000,delivery:'delivered',notification:'accepted'},{approval:'approved',paymentStatus:'paid',checkedAt:new Date(),paymentMode:'live',paymentAccount:'acct_fixture',paymentEnvironment:'prod',amountCents:20000,delivery:'not-started',notification:'accepted',scheduling:'confirmed',sessionAt:'2030-01-01'},{paymentStatus:'refunded-or-partial',amountCents:30000,paymentMode:'live',notification:'accepted'},{paymentStatus:'paid',amountCents:40000,paymentMode:'live',notification:'accepted'}].map(engagement=>({engagement}));
 const s=summarize(rows,new Date('2026-01-01').getTime());assert.equal(s.inquiries,1);assert.equal(s.paid,2);assert.equal(s.livePaidCents,20000);assert.equal(s.upcoming,1);assert.equal(s.attention,3);assert.equal(s.awaitingDelivery,1);
});
test('booking validates dates, zones, links and cancellation clears active appointment',()=>{
 const input={scheduling:'confirmed',sessionAt:'2030-01-01T18:00:00Z',sessionTimeZone:'America/Chicago',bookingReference:'fixture',meetingUrl:'https://example.test/meeting'};
 assert.equal(booking(input,{})['engagement.sessionAt'].toISOString(),input.sessionAt.replace('00Z','00.000Z'));
 for(const bad of [{...input,sessionTimeZone:'bad'},{...input,sessionAt:'invalid'},{...input,meetingUrl:'javascript:alert(1)'},{...input,scheduling:'cancelled'}])assert.throws(()=>booking(bad,{}));
 assert.equal(booking({...input,scheduling:'cancelled',sessionAt:''},{})['engagement.sessionAt'],null);
});
