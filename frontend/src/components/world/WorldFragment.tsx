import { safeWorldLink, type WorldFragmentData } from '@/lib/worldExperience';

/** A published fragment can be inspected without taking over the listening experience. */
export default function WorldFragment({ fragment }: { fragment: WorldFragmentData }) {
  const href = safeWorldLink(fragment.href);
  return <details className="world-fragment">
    <summary><span>{fragment.eyebrow || 'Fragment'}</span><strong>{fragment.title}</strong><i aria-hidden="true">↗</i></summary>
    <div className="world-fragment-body">
      {fragment.body && <p>{fragment.body}</p>}
      {href && <a href={href} target="_blank" rel="noreferrer">Open fragment ↗</a>}
      {!fragment.body && !href && <p>A small piece of this world.</p>}
    </div>
  </details>;
}
