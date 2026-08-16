"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import OwnerAccessGate from "@/components/admin/OwnerAccessGate";
import {
  NEXUS_EDITORIAL_QUERY,
  SET_NEXUS_FEATURED_SIGNAL_MUTATION,
  SET_NEXUS_REALM_ANCHOR_MUTATION,
  SET_NEXUS_REALM_ORDER_MUTATION,
} from "@/graphql/nexusEditorial";

const REALMS = [
  { id: 303, name: "Fractured Frontier", force: "Creation / Rupture" },
  { id: 202, name: "The Veil", force: "Perception / Illusion" },
  { id: 101, name: "Moonlit Roads", force: "Reflection / Identity" },
  { id: 55, name: "Skybound City", force: "Construction / Power" },
  { id: 44, name: "Astral Bazaar", force: "Exchange / Value" },
  { id: 0, name: "InterSiddhi", force: "Integration / Authenticity" },
];

type Track = {
  id: string;
  title: string;
  slug: string;
  realmId: number | null;
  nexusRole: string;
  isRealmAnchor: boolean;
  nexusSortOrder: number;
  artworkUrl?: string | null;
  releaseCoverArtUrl?: string | null;
  audioUrl?: string | null;
  previewAudioUrl?: string | null;
  accessTier: string;
  canAccessAudio: boolean;
  accessGate: string;
  nexusReviewStatus: string;
  showInNexus: boolean;
};

type Signal = {
  track: Track;
  releaseWorld: { id: string; title: string; slug: string; releaseType: string; coverArtUrl?: string | null };
  creativeProfile?: { id: string; artistName?: string | null; displayName?: string | null; slug?: string | null } | null;
};

type Config = {
  id: string;
  key: string;
  featuredTrackId?: string | null;
  realmAnchors: { realmId: number; trackId?: string | null }[];
  realmOrders: { realmId: number; trackIds: string[] }[];
  updatedBy?: string | null;
  updatedAt?: string | null;
};

type QueryData = { nexusEditorialConfig: Config; nexusPublishedSignals: Signal[] };

function realmAnchorId(config: Config | undefined, realmId: number) {
  return config?.realmAnchors?.find((entry) => entry.realmId === realmId)?.trackId ?? null;
}

function realmOrder(config: Config | undefined, realmId: number) {
  return config?.realmOrders?.find((entry) => entry.realmId === realmId)?.trackIds ?? [];
}

function signalArtwork(signal?: Signal | null) {
  return signal?.track.artworkUrl || signal?.track.releaseCoverArtUrl || signal?.releaseWorld.coverArtUrl || "";
}

function creatorName(signal?: Signal | null) {
  return signal?.creativeProfile?.artistName || signal?.creativeProfile?.displayName || "Creator";
}

export default function NexusEditorialPage() {
  const { data, loading, error, refetch } = useQuery<QueryData>(NEXUS_EDITORIAL_QUERY, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [setFeatured] = useMutation(SET_NEXUS_FEATURED_SIGNAL_MUTATION);
  const [setAnchor] = useMutation(SET_NEXUS_REALM_ANCHOR_MUTATION);
  const [setOrder] = useMutation(SET_NEXUS_REALM_ORDER_MUTATION);
  const [working, setWorking] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const config = data?.nexusEditorialConfig;
  const signals = data?.nexusPublishedSignals ?? [];
  const byId = useMemo(() => new Map(signals.map((signal) => [signal.track.id, signal])), [signals]);
  const featured = config?.featuredTrackId ? byId.get(config.featuredTrackId) : undefined;

  function orderedSignalsForRealm(realmId: number) {
    const realmSignals = signals.filter((signal) => signal.track.realmId === realmId);
    const saved = realmOrder(config, realmId);
    const savedIndex = new Map(saved.map((id, index) => [id, index]));
    return [...realmSignals].sort((a, b) => {
      const ai = savedIndex.has(a.track.id) ? savedIndex.get(a.track.id)! : 9999 + (a.track.nexusSortOrder ?? 999);
      const bi = savedIndex.has(b.track.id) ? savedIndex.get(b.track.id)! : 9999 + (b.track.nexusSortOrder ?? 999);
      return ai - bi || a.track.title.localeCompare(b.track.title);
    });
  }

  async function mutate(label: string, key: string, action: () => Promise<unknown>) {
    setWorking(key);
    setFeedback("");
    try {
      await action();
      await refetch();
      setFeedback(label);
    } catch (mutationError) {
      setFeedback(mutationError instanceof Error ? mutationError.message : "Editorial update failed.");
    } finally {
      setWorking(null);
    }
  }

  async function chooseFeatured(signal: Signal) {
    await mutate(`${signal.track.title} is now the global Featured Signal.`, `featured:${signal.track.id}`, () =>
      setFeatured({ variables: { trackId: signal.track.id } })
    );
  }

  async function chooseAnchor(realmId: number, trackId: string) {
    const signal = byId.get(trackId);
    if (!signal) return;
    await mutate(`${signal.track.title} is now the Realm anchor.`, `anchor:${realmId}`, () =>
      setAnchor({ variables: { realmId, trackId } })
    );
  }

  async function move(realmId: number, trackId: string, direction: -1 | 1) {
    const ordered = orderedSignalsForRealm(realmId).map((signal) => signal.track.id);
    const index = ordered.indexOf(trackId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await mutate("Realm editorial order updated.", `order:${realmId}`, () =>
      setOrder({ variables: { realmId, orderedTrackIds: ordered } })
    );
  }

  return (
    <OwnerAccessGate>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 sm:p-7">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#DCBA5C]/80">Owner Nexus Editorial</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Curate the public Nexus</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Review decides what may enter. This console decides what leads, anchors each Realm, and appears first.</p>
            </div>
            <Link href="/admin/nexus" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">← Review Queue</Link>
          </div>
        </section>

        {feedback && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/75">{feedback}</div>}
        {loading && !data && <p className="mt-6 text-sm text-white/50">Loading Nexus editorial state…</p>}
        {error && <p className="mt-6 rounded-2xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-100">{error.message}</p>}

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#DCBA5C]/20 bg-[#DCBA5C]/[0.035]">
          <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="aspect-square bg-black/20 md:aspect-auto md:min-h-[220px]">
              {signalArtwork(featured) ? <img src={signalArtwork(featured)} alt="Featured Signal artwork" className="h-full w-full object-cover" /> : <div className="flex h-full min-h-[220px] items-center justify-center text-xs uppercase tracking-[0.18em] text-white/25">No Featured Signal</div>}
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#F4D982]/70">Global Featured Signal</p>
              {featured ? <>
                <h3 className="mt-2 text-2xl font-semibold">{featured.track.title}</h3>
                <p className="mt-1 text-sm text-white/50">{creatorName(featured)} · {featured.releaseWorld.title}</p>
                <p className="mt-4 text-sm leading-6 text-white/55">This is the current app-wide lead Signal. Changing it does not alter the track itself or its review approval.</p>
              </> : <p className="mt-3 text-sm leading-6 text-white/50">Choose any published Signal below to establish the current global entry point.</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5">
          {REALMS.map((realm) => {
            const realmSignals = orderedSignalsForRealm(realm.id);
            const anchorId = realmAnchorId(config, realm.id);
            return (
              <article key={realm.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Realm {realm.id}</p>
                    <h3 className="mt-1 text-xl font-semibold">{realm.name}</h3>
                    <p className="mt-1 text-sm text-white/45">{realm.force} · {realmSignals.length} published</p>
                  </div>
                  <label className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    Realm Anchor
                    <select value={anchorId ?? ""} onChange={(event) => chooseAnchor(realm.id, event.target.value)} disabled={!realmSignals.length || working === `anchor:${realm.id}`} className="mt-2 block min-w-[260px] rounded-2xl border border-white/10 bg-[#090D17] px-3 py-2.5 text-sm normal-case tracking-normal text-white disabled:opacity-50">
                      <option value="" disabled>Choose published Signal</option>
                      {realmSignals.map((signal) => <option key={signal.track.id} value={signal.track.id}>{signal.track.title} — {creatorName(signal)}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-3">
                  {realmSignals.map((signal, index) => {
                    const artwork = signalArtwork(signal);
                    const isFeatured = signal.track.id === config?.featuredTrackId;
                    const isAnchor = signal.track.id === anchorId;
                    return (
                      <div key={signal.track.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                        <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {artwork ? <img src={artwork} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="truncate text-sm text-white/90">{index + 1}. {signal.track.title}</strong>
                            {isFeatured && <span className="rounded-full border border-[#DCBA5C]/25 bg-[#DCBA5C]/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[#F4D982]">Featured</span>}
                            {isAnchor && <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-violet-100">Anchor</span>}
                          </div>
                          <p className="mt-1 truncate text-xs text-white/40">{creatorName(signal)} · {signal.releaseWorld.title}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/30">Access · {signal.track.accessTier || "public"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <button type="button" disabled={index === 0 || working === `order:${realm.id}`} onClick={() => move(realm.id, signal.track.id, -1)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 disabled:opacity-25">↑</button>
                          <button type="button" disabled={index === realmSignals.length - 1 || working === `order:${realm.id}`} onClick={() => move(realm.id, signal.track.id, 1)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 disabled:opacity-25">↓</button>
                          <button type="button" disabled={isFeatured || working?.startsWith("featured:")} onClick={() => chooseFeatured(signal)} className="rounded-full border border-[#DCBA5C]/20 bg-[#DCBA5C]/[0.06] px-3 py-1.5 text-xs text-[#F4D982] disabled:opacity-40">{isFeatured ? "Current Featured" : "Set Featured"}</button>
                        </div>
                      </div>
                    );
                  })}
                  {!realmSignals.length && <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">No published Signals in this Realm yet.</div>}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </OwnerAccessGate>
  );
}
