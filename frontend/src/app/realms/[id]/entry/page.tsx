"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
export default function RealmEntryRedirect() {
  const params = useParams<{id:string}>();
  const id = params?.id;
  const router = useRouter();
  useEffect(() => {
    const target = ['303','202','101','55','44','0'].includes(id ?? '') ? `/realms/${id}` : '/nexus#realm-soundtracks';
    router.replace(target.startsWith('/realms/') ? `${target}${window.location.search}${window.location.hash}` : target);
  }, [id, router]);
  return <p role="status" className="p-8">Entering the Realm…</p>;
}
