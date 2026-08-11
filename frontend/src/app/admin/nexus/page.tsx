"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import {
  NEXUS_REVIEW_ME_QUERY,
  NEXUS_REVIEW_QUEUE_QUERY,
  PUBLISH_TRACK_TO_NEXUS_MUTATION,
  REVIEW_NEXUS_SUBMISSION_MUTATION,
  UNPUBLISH_TRACK_FROM_NEXUS_MUTATION,
} from "@/graphql/nexusReview";

const REALMS = [
  { id: 303, label: "303 — Fractured Frontier" },
  { id: 202, label: "202 — The Veil" },
  { id: 101, label: "101 — Moonlit Roads" },
  { id: 55, label: "55 — Skybound City" },
  { id: 44, label: "44 — Astral Bazaar" },
  { id: 0, label: "0 — InterSiddhi" },
];

const STATUS_TABS = ["all", "in-review", "needs-changes", "approved", "published"];

type RealmScores = { realm303: number; realm202: number; realm101: number; realm55: number; realm44: number; realm0: number };

type ReviewItem = {
  releaseTrackCount: number;
  track: {
    id: string; title: string; slug: string; ownerId: string; trackNumber: number; role: string;
    realmId?: number | null; nexusReviewStatus: string; nexusSubmittedAt?: string | null;
    nexusReviewedAt?: string | null; nexusReviewedBy?: string | null; nexusReviewNotes?: string | null;
    nexusPublishedAt?: string | null; nexusPublishedBy?: string | null;
    nexusUnpublishedAt?: string | null; nexusUnpublishedBy?: string | null;
    showInNexus: boolean; status: string; visibility: string; playbackStatus: string;
    bpm?: number | null; keySignature?: string | null; mood?: string | null; hook?: string | null; notes?: string | null;
    audioUrl?: string | null; previewAudioUrl?: string | null; platformUrl?: string | null;
    artworkUrl?: string | null; releaseCoverArtUrl?: string | null;
    realmFinderSuggestedRealmId?: number | null; realmFinderSecondaryRealmId?: number | null;
    realmFinderTraceRealmId?: number | null; realmFinderAlignment?: number | null; realmFinderSignals?: string[] | null;
    realmFinderSummary?: string | null; realmFinderDominantSignal?: string | null; realmFinderExplanation?: string | null;
    realmFinderScores?: RealmScores | null; realmFinderVersion?: string | null;
  };
  releaseWorld: {
    id: string; title: string; slug: string; releaseType: string; visibility: string; status: string;
    coverArtUrl?: string | null; fullDropDate?: string | null;
  };
  creativeProfile?: { id: string; artistName: string; slug: string; displayName?: string | null } | null;
};

function label(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function realmLabel(id?: number | null) {
  if (id == null) return "—";
  return REALMS.find((realm) => realm.id === id)?.label || `Realm ${id}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function statusClasses(status: string) {
  if (status === "published") return "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100";
  if (status === "approved") return "border-[#DCBA5C]/30 bg-[#DCBA5C]/10 text-[#F4D982]";
  if (status === "needs-changes") return "border-rose-300/20 bg-rose-300/[0.06] text-rose-100";
  return "border-violet-300/20 bg-violet-300/[0.06] text-violet-100";
}

export default function NexusReviewPage() {
  const [status, setStatus] = useState("in-review");
  const [realmFilter, setRealmFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [realms, setRealms] = useState<Record<string, number>>({});
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data, loading, error, refetch } = useQuery(NEXUS_REVIEW_QUEUE_QUERY, {
    variables: { status: status === "all" ? null : status },
    fetchPolicy: "cache-and-network",
  });
  const { data: meData } = useQuery(NEXUS_REVIEW_ME_QUERY);
  const [reviewSubmission] = useMutation(REVIEW_NEXUS_SUBMISSION_MUTATION);
  const [publishTrack] = useMutation(PUBLISH_TRACK_TO_NEXUS_MUTATION);
  const [unpublishTrack] = useMutation(UNPUBLISH_TRACK_FROM_NEXUS_MUTATION);

  const items = (data?.nexusReviewQueue ?? []) as ReviewItem[];
  const me = meData?.me;
  const canPublish = me?.role === "owner" || (me?.platformPermissions ?? []).includes("nexus.publish");

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const realm = realms[item.track.id] ?? item.track.realmId;
      if (realmFilter !== "all" && String(realm ?? "") !== realmFilter) return false;
      if (!needle) return true;
      const haystack = [
        item.track.title,
        item.releaseWorld.title,
        item.releaseWorld.releaseType,
        item.creativeProfile?.artistName,
        item.creativeProfile?.displayName,
        item.track.realmFinderDominantSignal,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, realmFilter, search, realms]);

  async function review(item: ReviewItem, decision: "approve" | "needs-changes") {
    const reviewNote = notes[item.track.id] ?? item.track.nexusReviewNotes ?? "";
    if (decision === "needs-changes" && !reviewNote.trim()) {
      setFeedback("Add a review note before requesting changes.");
      return;
    }
    setWorkingId(item.track.id);
    setFeedback("");
    try {
      await reviewSubmission({ variables: {
        trackId: item.track.id,
        decision,
        realmId: realms[item.track.id] ?? item.track.realmId ?? null,
        notes: reviewNote,
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

  async function unpublish(item: ReviewItem) {
    setWorkingId(item.track.id);
    setFeedback("");
    try {
      await unpublishTrack({ variables: { trackId: item.track.id, notes: notes[item.track.id] ?? "" } });
      setFeedback(`${item.track.title} was removed from the live Nexus and remains approved.`);
      await refetch();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Nexus unpublish failed.");
    } finally { setWorkingId(null); }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#DCBA5C]/80">Nexus Editorial</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Editorial Console</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Hear the signal, understand its world, review Realm placement, and control the full Nexus publication lifecycle.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">{filteredItems.length} visible · {items.length} loaded</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full border px-4 py-2 text-sm transition ${status === value ? "border-[#DCBA5C]/35 bg-[#DCBA5C]/12 text-[#F4D982]" : "border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/[0.06]"}`}>
              {label(value)}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search track, creator, release, signal…" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25" />
          <select value={realmFilter} onChange={(event) => setRealmFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#090D17] px-4 py-3 text-sm text-white">
            <option value="all">All Realms</option>
            {REALMS.map((realm) => <option key={realm.id} value={realm.id}>{realm.label}</option>)}
          </select>
        </div>
      </section>

      {feedback && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/75">{feedback}</div>}
      {loading && <p className="mt-6 text-sm text-white/50">Loading Nexus submissions…</p>}
      {error && <p className="mt-6 text-sm text-rose-200">{error.message}</p>}

      <section className="mt-6 grid gap-5">
        {filteredItems.map((item) => {
          const track = item.track;
          const realmValue = realms[track.id] ?? track.realmId ?? 202;
          const audioSource = track.previewAudioUrl || track.audioUrl || "";
          const artwork = track.artworkUrl || track.releaseCoverArtUrl || item.releaseWorld.coverArtUrl || "";
          const reviewNote = notes[track.id] ?? track.nexusReviewNotes ?? "";
          return (
            <article key={track.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="border-b border-white/10 bg-black/25 p-5 lg:border-b-0 lg:border-r">
                  <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                    {artwork ? <img src={artwork} alt={`${track.title} artwork`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-6 text-center text-xs uppercase tracking-[0.18em] text-white/25">No artwork</div>}
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Audio Review</p>
                    {audioSource ? <audio controls preload="metadata" src={audioSource} className="mt-2 w-full" /> : <p className="mt-2 text-xs leading-5 text-white/40">No playable audio source is attached to this track.</p>}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{item.creativeProfile?.artistName || "Creator"}</p>
                      <h3 className="mt-2 text-2xl font-semibold">{track.title}</h3>
                      <p className="mt-1 text-sm text-white/50">{item.releaseWorld.title} · {label(item.releaseWorld.releaseType)} · Track {track.trackNumber} of {item.releaseTrackCount || "?"}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full border px-3 py-1.5 ${statusClasses(track.nexusReviewStatus)}`}>{label(track.nexusReviewStatus)}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/55">{label(track.visibility)}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/55">{label(track.playbackStatus)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/releases/${item.releaseWorld.slug}/board`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">Open Board</Link>
                      <Link href={`/releases/${item.releaseWorld.slug}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">Portal</Link>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">BPM</span><strong className="mt-1 block text-sm text-white/80">{track.bpm ?? "—"}</strong></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Key</span><strong className="mt-1 block text-sm text-white/80">{track.keySignature || "—"}</strong></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Creative state</span><strong className="mt-1 block text-sm text-white/80">{label(track.status)}</strong></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Role</span><strong className="mt-1 block text-sm text-white/80">{label(track.role)}</strong></div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Creator Home Realm</p>
                      <strong className="mt-2 block text-sm text-white/85">{realmLabel(track.realmId)}</strong>
                      {track.notes && <p className="mt-3 line-clamp-4 text-xs leading-5 text-white/45">{track.notes}</p>}
                    </div>

                    <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-violet-200/65">Realm Profile</p>
                      {track.realmFinderSuggestedRealmId != null ? <>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl border border-violet-200/15 bg-violet-200/[0.035] p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Home</span><strong className="mt-1.5 block text-xs text-white/90">{realmLabel(track.realmFinderSuggestedRealmId)}</strong></div>
                          <div className="rounded-xl border border-white/8 bg-black/10 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Secondary</span><strong className="mt-1.5 block text-xs text-white/80">{realmLabel(track.realmFinderSecondaryRealmId)}</strong></div>
                          <div className="rounded-xl border border-white/8 bg-black/10 p-3"><span className="text-[9px] uppercase tracking-[0.16em] text-white/35">Trace</span><strong className="mt-1.5 block text-xs text-white/80">{realmLabel(track.realmFinderTraceRealmId)}</strong></div>
                        </div>
                        {track.realmFinderDominantSignal && <p className="mt-3 text-xs font-medium text-violet-100/75">Dominant signal · {track.realmFinderDominantSignal}</p>}
                        {track.realmFinderExplanation && <p className="mt-2 text-xs leading-5 text-white/50">{track.realmFinderExplanation}</p>}
                        {track.realmFinderScores && <details className="mt-3 border-t border-white/5 pt-3"><summary className="cursor-pointer text-[10px] uppercase tracking-[0.14em] text-white/40">Full resonance</summary><div className="mt-3 grid gap-2">{REALMS.map((realm) => { const key = `realm${realm.id}` as keyof RealmScores; const score = track.realmFinderScores?.[key] ?? 0; return <div key={realm.id}><div className="mb-1 flex justify-between gap-3 text-[10px] text-white/45"><span>{realm.label}</span><strong>{score}</strong></div><div className="h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-200/45" style={{ width: `${score}%` }} /></div></div>; })}</div></details>}
                      </> : <p className="mt-2 text-xs leading-5 text-white/40">Creator did not use Realm Finder for this submission.</p>}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                    <label className="text-xs uppercase tracking-[0.16em] text-white/40">Final Realm<select value={realmValue} onChange={(event) => setRealms((current) => ({ ...current, [track.id]: Number(event.target.value) }))} disabled={track.nexusReviewStatus !== "in-review"} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#090D17] px-3 py-3 text-sm normal-case tracking-normal text-white disabled:opacity-50">{REALMS.map((realm) => <option key={realm.id} value={realm.id}>{realm.label}</option>)}</select></label>
                    <label className="text-xs uppercase tracking-[0.16em] text-white/40">Editorial Notes<textarea value={reviewNote} onChange={(event) => setNotes((current) => ({ ...current, [track.id]: event.target.value }))} rows={4} placeholder="Feedback, editorial reasoning, or unpublish note" className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-[#090D17] px-3 py-3 text-sm normal-case tracking-normal text-white placeholder:text-white/25" /></label>
                  </div>

                  <div className="mt-4 grid gap-2 text-[11px] text-white/40 sm:grid-cols-2 xl:grid-cols-4">
                    <span>Submitted · {formatDate(track.nexusSubmittedAt)}</span>
                    <span>Reviewed · {formatDate(track.nexusReviewedAt)}</span>
                    <span>Published · {formatDate(track.nexusPublishedAt)}</span>
                    <span>Unpublished · {formatDate(track.nexusUnpublishedAt)}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {track.nexusReviewStatus === "in-review" && <>
                      <button type="button" disabled={workingId === track.id} onClick={() => review(item, "needs-changes")} className="rounded-full border border-rose-300/20 bg-rose-300/[0.06] px-4 py-2 text-sm text-rose-100 disabled:opacity-50">Request Changes</button>
                      <button type="button" disabled={workingId === track.id} onClick={() => review(item, "approve")} className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-4 py-2 text-sm font-medium text-[#F4D982] disabled:opacity-50">Approve</button>
                    </>}
                    {track.nexusReviewStatus === "approved" && (canPublish ? <button type="button" disabled={workingId === track.id} onClick={() => publish(item)} className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2 text-sm text-emerald-100 disabled:opacity-50">Publish to Nexus</button> : <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/45">Awaiting publishing authority</span>)}
                    {track.nexusReviewStatus === "published" && <>{<span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2 text-sm text-emerald-100">Live in Nexus</span>}{canPublish && <button type="button" disabled={workingId === track.id} onClick={() => unpublish(item)} className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2 text-sm text-amber-100 disabled:opacity-50">Unpublish</button>}</>}
                    {track.nexusReviewStatus === "needs-changes" && <span className="rounded-full border border-rose-300/20 bg-rose-300/[0.06] px-4 py-2 text-sm text-rose-100">Waiting on creator revision</span>}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && filteredItems.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">No submissions match this view.</div>}
      </section>
    </main>
  );
}
