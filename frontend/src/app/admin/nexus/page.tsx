"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import {
  NEXUS_REVIEW_ME_QUERY,
  NEXUS_REVIEW_QUEUE_QUERY,
  PUBLISH_TRACK_TO_NEXUS_MUTATION,
  REVIEW_NEXUS_SUBMISSION_MUTATION,
} from "@/graphql/nexusReview";

const REALMS = [
  { id: 303, label: "303 — Fractured Frontier" },
  { id: 202, label: "202 — The Veil" },
  { id: 101, label: "101 — Moonlit Roads" },
  { id: 55, label: "55 — Skybound City" },
  { id: 44, label: "44 — Astral Bazaar" },
  { id: 0, label: "0 — InterSiddhi" },
];

type ReviewItem = {
  track: {
    id: string; title: string; ownerId: string; realmId?: number | null;
    nexusReviewStatus: string; nexusSubmittedAt?: string | null; nexusReviewNotes?: string | null;
    showInNexus: boolean; status: string; visibility: string; playbackStatus: string;
    realmFinderSuggestedRealmId?: number | null; realmFinderSecondaryRealmId?: number | null;
    realmFinderTraceRealmId?: number | null; realmFinderAlignment?: number | null; realmFinderSignals?: string[] | null;
    realmFinderSummary?: string | null; realmFinderDominantSignal?: string | null; realmFinderExplanation?: string | null;
    realmFinderScores?: { realm303: number; realm202: number; realm101: number; realm55: number; realm44: number; realm0: number } | null;
    realmFinderVersion?: string | null;
  };
  releaseWorld: { id: string; title: string; slug: string; visibility: string; status: string };
  creativeProfile?: { id: string; artistName: string; slug: string; displayName?: string | null } | null;
};

function label(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NexusReviewPage() {
  const [status, setStatus] = useState("in-review");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [realms, setRealms] = useState<Record<string, number>>({});
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data, loading, error, refetch } = useQuery(NEXUS_REVIEW_QUEUE_QUERY, {
    variables: { status },
    fetchPolicy: "cache-and-network",
  });
  const { data: meData } = useQuery(NEXUS_REVIEW_ME_QUERY);
  const [reviewSubmission] = useMutation(REVIEW_NEXUS_SUBMISSION_MUTATION);
  const [publishTrack] = useMutation(PUBLISH_TRACK_TO_NEXUS_MUTATION);

  const items = (data?.nexusReviewQueue ?? []) as ReviewItem[];
  const me = meData?.me;
  const canPublish = me?.role === "owner" || (me?.platformPermissions ?? []).includes("nexus.publish");

  const counts = useMemo(() => ({ visible: items.length }), [items.length]);

  async function review(item: ReviewItem, decision: "approve" | "needs-changes") {
    setWorkingId(item.track.id);
    setFeedback("");
    try {
      await reviewSubmission({ variables: {
        trackId: item.track.id,
        decision,
        realmId: realms[item.track.id] ?? item.track.realmId ?? null,
        notes: notes[item.track.id] ?? "",
      }});
      setFeedback(decision === "approve" ? `${item.track.title} approved.` : `${item.track.title} returned for changes.`);
      await refetch();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Review failed.");
    } finally { setWorkingId(null); }
  }

  async function publish(item: ReviewItem) {
    setWorkingId(item.track.id);
    setFeedback("");
    try {
      await publishTrack({ variables: { trackId: item.track.id } });
      setFeedback(`${item.track.title} is now live in Nexus.`);
      await refetch();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Nexus publishing failed.");
    } finally { setWorkingId(null); }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#DCBA5C]/80">Nexus Editorial</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Nexus Review</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Review creator submissions, confirm Realm placement, request changes, and move approved signals toward publication.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">{counts.visible} in current view</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["in-review", "needs-changes", "approved", "published"].map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full border px-4 py-2 text-sm transition ${status === value ? "border-[#DCBA5C]/35 bg-[#DCBA5C]/12 text-[#F4D982]" : "border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/[0.06]"}`}>
              {label(value)}
            </button>
          ))}
        </div>
      </section>

      {feedback && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/75">{feedback}</div>}
      {loading && <p className="mt-6 text-sm text-white/50">Loading Nexus submissions…</p>}
      {error && <p className="mt-6 text-sm text-rose-200">{error.message}</p>}

      <section className="mt-6 grid gap-4">
        {items.map((item) => {
          const track = item.track;
          const realmValue = realms[track.id] ?? track.realmId ?? 202;
          return (
            <article key={track.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{item.creativeProfile?.artistName || "Creator"} · {item.releaseWorld.title}</p>
                  <h3 className="mt-2 text-xl font-semibold">{track.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
                    <span className="rounded-full border border-white/10 px-3 py-1.5">{label(track.nexusReviewStatus)}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5">{label(track.visibility)}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5">{label(track.playbackStatus)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/releases/${item.releaseWorld.slug}/board`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">Open Board</Link>
                  <Link href={`/releases/${item.releaseWorld.slug}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">Portal</Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Creator Suggested Realm</p>
                  <strong className="mt-2 block text-sm text-white/85">
                    {REALMS.find((realm) => realm.id === track.realmId)?.label || "No Realm selected"}
                  </strong>
                  <p className="mt-2 text-xs leading-5 text-white/45">This is the creator’s current creative placement and remains editable during review.</p>
                </div>

                <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-200/65">Realm Profile</p>

                  {track.realmFinderSuggestedRealmId != null ? (
                    <>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-violet-200/15 bg-violet-200/[0.035] p-3">
                          <span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Home suggestion</span>
                          <strong className="mt-1.5 block text-xs text-white/90">{REALMS.find((realm) => realm.id === track.realmFinderSuggestedRealmId)?.label || `Realm ${track.realmFinderSuggestedRealmId}`}</strong>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                          <span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Secondary</span>
                          <strong className="mt-1.5 block text-xs text-white/80">{track.realmFinderSecondaryRealmId != null ? (REALMS.find((realm) => realm.id === track.realmFinderSecondaryRealmId)?.label || `Realm ${track.realmFinderSecondaryRealmId}`) : "—"}</strong>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                          <span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Trace</span>
                          <strong className="mt-1.5 block text-xs text-white/80">{track.realmFinderTraceRealmId != null ? (REALMS.find((realm) => realm.id === track.realmFinderTraceRealmId)?.label || `Realm ${track.realmFinderTraceRealmId}`) : "—"}</strong>
                        </div>
                      </div>

                      {track.realmFinderDominantSignal && <p className="mt-3 text-xs font-medium text-violet-100/75">Dominant signal · {track.realmFinderDominantSignal}</p>}
                      {track.realmFinderExplanation && <p className="mt-2 text-xs leading-5 text-white/50">{track.realmFinderExplanation}</p>}

                      {track.realmFinderScores && (
                        <details className="mt-3 border-t border-white/5 pt-3">
                          <summary className="cursor-pointer text-[10px] uppercase tracking-[0.14em] text-white/40">Full resonance</summary>
                          <div className="mt-3 grid gap-2">
                            {REALMS.map((realm) => {
                              const key = `realm${realm.id}` as keyof NonNullable<ReviewItem["track"]["realmFinderScores"]>;
                              const score = track.realmFinderScores?.[key] ?? 0;
                              return (
                                <div key={realm.id}>
                                  <div className="mb-1 flex justify-between gap-3 text-[10px] text-white/45"><span>{realm.label}</span><strong>{score}</strong></div>
                                  <div className="h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-200/45" style={{ width: `${score}%` }} /></div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      )}

                      {!!track.realmFinderSignals?.length && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {track.realmFinderSignals.map((signal) => (
                            <span key={signal} className="rounded-full border border-violet-200/10 bg-violet-200/[0.035] px-2.5 py-1 text-[10px] text-violet-100/65">{signal}</span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-white/40">Creator did not use Realm Finder for this submission.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                <label className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Final Realm
                  <select value={realmValue} onChange={(event) => setRealms((current) => ({ ...current, [track.id]: Number(event.target.value) }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090D17] px-3 py-3 text-sm normal-case tracking-normal text-white">
                    {REALMS.map((realm) => <option key={realm.id} value={realm.id}>{realm.label}</option>)}
                  </select>
                </label>
                <label className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Review Notes
                  <textarea value={notes[track.id] ?? track.nexusReviewNotes ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [track.id]: event.target.value }))} rows={3} placeholder="Optional feedback for the creator" className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-[#090D17] px-3 py-3 text-sm normal-case tracking-normal text-white placeholder:text-white/25" />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {track.nexusReviewStatus === "in-review" && <>
                  <button type="button" disabled={workingId === track.id} onClick={() => review(item, "needs-changes")} className="rounded-full border border-rose-300/20 bg-rose-300/[0.06] px-4 py-2 text-sm text-rose-100 disabled:opacity-50">Request Changes</button>
                  <button type="button" disabled={workingId === track.id} onClick={() => review(item, "approve")} className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-4 py-2 text-sm font-medium text-[#F4D982] disabled:opacity-50">Approve</button>
                </>}
                {track.nexusReviewStatus === "approved" && (canPublish ?
                  <button type="button" disabled={workingId === track.id} onClick={() => publish(item)} className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2 text-sm text-emerald-100 disabled:opacity-50">Publish to Nexus</button> :
                  <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/45">Awaiting publishing authority</span>
                )}
                {track.nexusReviewStatus === "published" && <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2 text-sm text-emerald-100">Live in Nexus</span>}
              </div>
            </article>
          );
        })}
        {!loading && items.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">No submissions in this view.</div>}
      </section>
    </main>
  );
}