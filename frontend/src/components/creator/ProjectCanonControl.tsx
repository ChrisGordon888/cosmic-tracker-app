'use client';

import Link from 'next/link';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

export const CURATE_WORLD = gql`
  mutation CuratePublicWorld($id: ID!, $expectedUpdatedAt: String!, $selected: Boolean!) {
    curatePublicWorld(id: $id, expectedUpdatedAt: $expectedUpdatedAt, selected: $selected) {
      id publicCanon updatedAt
    }
  }
`;

type World = { id: string; title: string; publicCanon?: boolean | null; updatedAt?: string | null; visibility: string };

export default function ProjectCanonControl({ world, onSaved }: { world: World; onSaved: () => Promise<unknown> }) {
  const [save, { loading }] = useMutation(CURATE_WORLD);
  const [message, setMessage] = useState('');
  async function choose(selected: boolean) {
    if (!world.updatedAt || loading || selected === (world.publicCanon === true)) return;
    if (!window.confirm(`${world.title}: ${selected ? 'select Canon public presentation' : 'hide from discovery'}? Publication, direct URL access, child track choices and Nexus selection will not change.`)) return;
    setMessage('');
    try {
      await save({ variables: { id: world.id, expectedUpdatedAt: world.updatedAt, selected } });
      await onSaved();
      setMessage('Public presentation saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save. Reload before retrying.');
    }
  }
  return <section className="my-4 rounded-xl border border-white/15 p-4 text-sm" aria-label={`Public presentation for ${world.title}`}>
    <p className="text-xs uppercase tracking-widest">Public presentation</p>
    <p className="my-2 font-semibold">{world.publicCanon === true ? 'Canon' : 'Hidden from discovery'}</p>
    <p>{world.publicCanon === true ? 'Represent this World as part of my current public work.' : 'Keep publication / direct URL where allowed, without broad project discovery.'}</p>
    {world.visibility !== 'public' && <p className="mt-2">Discovery also requires a published public World. This choice does not publish it.</p>}
    <div className="my-3 flex flex-wrap gap-2">
      <button type="button" className="min-h-11 rounded-lg border border-white/25 px-3" disabled={loading || !world.updatedAt || world.publicCanon === true} onClick={() => void choose(true)}>Canon</button>
      <button type="button" className="min-h-11 rounded-lg border border-white/25 px-3" disabled={loading || !world.updatedAt || world.publicCanon !== true} onClick={() => void choose(false)}>Hidden from discovery</button>
    </div>
    {world.publicCanon === true && world.visibility === 'public' && <p className="mb-3"><Link href="/nexus#canon-worlds">Explore curated Nexus Worlds →</Link></p>}
    <p className="text-xs">Canon makes this World eligible for Nexus editorial consideration. It does not automatically place it in Nexus. Child track Canon / Listed / Private choices stay unchanged.</p>
    <p role="status">{message}</p>
  </section>;
}
