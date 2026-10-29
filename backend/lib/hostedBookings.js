function hostedBookings(env=process.env) {
 const valid=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
 return { discovery:valid(env.SERVICES_DISCOVERY_SCHEDULING_URL), paid:valid(env.SERVICES_SCHEDULING_URL) };
}
async function scheduleSession(service,id,kind,env=process.env){
 const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
 if(!['discovery','paid-session'].includes(kind))fail('Choose a session type.');
 const urls=hostedBookings(env),url=kind==='discovery'?urls.discovery:urls.paid;
 if(!url)fail('Hosted scheduling is not configured for this session type.',503);
 const record=kind==='paid-session'?await service.reconcile(id):await service.get(id);
 if(kind==='paid-session'&&(record.engagement.approval!=='approved'||record.engagement.paymentStatus!=='paid'||!record.engagement.checkedAt))fail('Approve scope and verify payment before scheduling a paid session.');
 return {url}; // No private customer data in URL, and no implied booking confirmation.
}
module.exports={hostedBookings,scheduleSession};
