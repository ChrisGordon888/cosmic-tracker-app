'use client';
import Link from 'next/link';
import {useCommercialAccess} from './CommercialAccess';
export default function EngagementNavigation(){const {allowed,attention}=useCommercialAccess();if(!allowed)return null;return <section className="creator-business-entry"><div><h2>Publish & operate</h2><p>{attention===null?'Your authorized publishing and business tools.':`${attention} engagement${attention===1?'':'s'} requiring action.`}</p></div><nav aria-label="Publishing and business shortcuts"><Link href="/creator/media">Media Studio →</Link><Link href="/creator/marketplace">Marketplace →</Link><Link href="/creator/engagements">Engagements →</Link></nav></section>;}
