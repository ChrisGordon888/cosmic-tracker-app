/** Convert wall time using the selected IANA zone, independent of the browser zone. */
export function localBookingTime(instant: string, zone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' }).formatToParts(new Date(instant));
  const get=(key:string)=>parts.find(p=>p.type===key)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function bookingInstant(local: string, zone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw Error('Enter a complete local date and time.');
  const naive=Date.parse(`${local}:00Z`);
  if (!Number.isFinite(naive)) throw Error('Enter a valid local date and time.');
  const offsets=new Set<number>();
  // Sample both sides of any nearby offset transition, including half-hour zones.
  for(let hour=-36;hour<=36;hour+=6){const t=naive+hour*3600000;offsets.add(Date.parse(`${localBookingTime(new Date(t).toISOString(),zone)}:00Z`)-t);}
  const matches=[...offsets].map(offset=>naive-offset).filter(t=>localBookingTime(new Date(t).toISOString(),zone)===local);
  if(matches.length===0) throw Error('This local time does not exist in that time zone. Choose another time.');
  if(matches.length>1) throw Error('This local time occurs twice during daylight saving. Choose an unambiguous time and confirm it with the client.');
  return new Date(matches[0]).toISOString();
}
