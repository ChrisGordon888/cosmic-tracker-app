import { Suspense } from 'react';
import EditorialStudio from '@/components/admin/editorial/EditorialStudio';
export default function EditorialStudioPage() {
 return <Suspense fallback={<p role="status" className="p-8">Loading Editorial Studio…</p>}><EditorialStudio/></Suspense>;
}
