export type Engagement = { inquiryId:string; name:string; email:string; offer:string; context:string; links:string; timeline:string; approval:string; scope?:string; agreement?:string; amountCents?:number; paymentStatus:string; paymentMode?:string; sessionId?:string; checkoutUrl?:string; invoiceId?:string; checkedAt?:string; scheduling:string; delivery:string; followUpNote?:string; notification:string; sessionAt?:string; sessionTimeZone?:string; sessionKind?:string; bookingReference?:string; meetingUrl?:string };
export type EngagementRecord = { _id:string; title:string; nextAction:string; createdAt?:string; engagement:Engagement };
export function filterEngagements(records:EngagementRecord[],search:string,status:string){
 const q=search.trim().toLowerCase();
 return records.filter(r=>{const e=r.engagement;const matches=!q||[r.title,e.name,e.email,e.inquiryId,e.context].some(x=>x?.toLowerCase().includes(q));
 return matches&&(status==='all'||status==='inquiry'&&e.approval==='inquiry'||status==='payment'&&e.approval==='approved'&&e.paymentStatus!=='paid'||status==='paid'&&e.paymentStatus==='paid'||status==='delivery'&&e.paymentStatus==='paid'&&e.delivery!=='delivered');});
}
