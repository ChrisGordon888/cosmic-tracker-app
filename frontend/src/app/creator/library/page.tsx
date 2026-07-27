"use client";

import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import "@/styles/creatorLibrary.css";

const CREATOR_LIBRARY_QUERY = gql`
  query CreatorLibrary {
    myReleaseWorlds {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      coverArtUrl
      updatedAt
    }

    myReleaseTracks {
      id
      releaseWorldId
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      audioUrl
      previewAudioUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      updatedAt
    }
  }
`;

type LibraryView = "tracks" | "releases" | "realms" | "publishing";

type ReleaseWorld = {
  id: string;
  title: string;
  slug: string;
  releaseType: string;
  status: string;
  visibility: string;
  isFeatured: boolean;
  coverArtUrl?: string | null;
  updatedAt?: string | null;
};

type ReleaseTrack = {
  id: string;
  releaseWorldId: string;
  title: string;
  slug: string;
  trackNumber: number;
  role: string;
  status: string;
  bpm?: number | null;
  keySignature?: string | null;
  mood?: string | null;
  audioUrl?: string | null;
  previewAudioUrl?: string | null;
  visibility: string;
  playbackStatus: string;
  dropDate?: string | null;
  unlockDate?: string | null;
  realmId?: number | null;
  showInNexus: boolean;
  nexusRole: string;
  isRealmAnchor: boolean;
  isPublicPick: boolean;
  nexusSortOrder: number;
  updatedAt?: string | null;
};

const REALMS = [
  { id: 303, name: "Fractured Frontier", color: "#FF5D7A" },
  { id: 202, name: "The Veil", color: "#A884FF" },
  { id: 101, name: "Moonlit Roads", color: "#7ED3FF" },
  { id: 55, name: "Skybound City", color: "#ECC973" },
  { id: 44, name: "Astral Bazaar", color: "#F4AB63" },
  { id: 0, name: "InterSiddhi", color: "#EEF3FA" },
] as const;

function formatLabel(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRealmMeta(realmId?: number | null) {
  return REALMS.find((realm) => realm.id === realmId) ?? null;
}

function hasAudio(track: ReleaseTrack) {
  return Boolean(track.audioUrl?.trim() || track.previewAudioUrl?.trim());
}

function getPublishingState(track: ReleaseTrack, release?: ReleaseWorld | null) {
  if (track.showInNexus) return "published";
  if (track.status === "archived") return "archived";
  if (track.realmId === null || track.realmId === undefined) return "needs-realm";
  if (!hasAudio(track) && track.playbackStatus !== "coming-soon") return "needs-audio";
  if (track.visibility === "private") return "needs-access";
  if (release && release.visibility !== "public") return "needs-release";
  if (["playable", "preview", "coming-soon"].includes(track.playbackStatus)) return "ready";
  return "draft";
}

function getPublishingLabel(state: string) {
  const labels: Record<string, string> = {
    published: "Published",
    ready: "Ready to publish",
    "needs-realm": "Needs realm",
    "needs-audio": "Needs audio",
    "needs-access": "Needs public access",
    "needs-release": "Release not public",
    archived: "Archived",
    draft: "Draft",
  };
  return labels[state] ?? formatLabel(state);
}

function formatDate(value?: string | null) {
  if (!value) return "Not edited yet";
  const date = new Date(Number.isFinite(Number(value)) ? Number(value) : value);
  if (Number.isNaN(date.getTime())) return "Recently edited";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function CreatorLibraryPage() {
  const { status } = useSession();
  const [view, setView] = useState<LibraryView>("tracks");
  const [search, setSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("all");
  const [realmFilter, setRealmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishingFilter, setPublishingFilter] = useState("all");

  const { data, loading, error, refetch } = useQuery(CREATOR_LIBRARY_QUERY, {
    skip: status !== "authenticated",
    fetchPolicy: "cache-and-network",
  });

  const releases: ReleaseWorld[] = data?.myReleaseWorlds ?? [];
  const tracks: ReleaseTrack[] = data?.myReleaseTracks ?? [];

  const releaseMap = useMemo(
    () => new Map(releases.map((release) => [release.id, release])),
    [releases],
  );

  const enrichedTracks = useMemo(
    () =>
      tracks.map((track) => {
        const release = releaseMap.get(track.releaseWorldId) ?? null;
        return {
          ...track,
          release,
          publishingState: getPublishingState(track, release),
        };
      }),
    [tracks, releaseMap],
  );

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedTracks.filter((track) => {
      const realm = getRealmMeta(track.realmId);
      const release = track.release;
      const searchTarget = [
        track.title,
        track.slug,
        track.mood,
        track.role,
        release?.title,
        realm?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchTarget.includes(query)) &&
        (releaseFilter === "all" || track.releaseWorldId === releaseFilter) &&
        (realmFilter === "all" || String(track.realmId) === realmFilter) &&
        (statusFilter === "all" || track.status === statusFilter) &&
        (publishingFilter === "all" || track.publishingState === publishingFilter)
      );
    });
  }, [enrichedTracks, search, releaseFilter, realmFilter, statusFilter, publishingFilter]);

  const summary = useMemo(() => {
    return {
      total: tracks.length,
      published: enrichedTracks.filter((track) => track.showInNexus).length,
      needsRealm: enrichedTracks.filter((track) => track.publishingState === "needs-realm").length,
      needsAudio: enrichedTracks.filter((track) => track.publishingState === "needs-audio").length,
      ready: enrichedTracks.filter((track) => track.publishingState === "ready").length,
      comingSoon: enrichedTracks.filter((track) => track.playbackStatus === "coming-soon").length,
    };
  }, [tracks.length, enrichedTracks]);

  if (status === "loading") {
    return (
      <main className="creator-library-page">
        <section className="creator-library-shell creator-library-message">
          <p className="creator-library-kicker">Creator Library</p>
          <h1>Opening the catalog...</h1>
        </section>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="creator-library-page">
        <section className="creator-library-shell creator-library-message">
          <p className="creator-library-kicker">Creator Library</p>
          <h1>Sign in to manage your universe.</h1>
          <p>Your track catalog, realm assignments, releases, and publishing states live here.</p>
          <button type="button" onClick={() => signIn("github")}>Sign in with GitHub</button>
        </section>
      </main>
    );
  }

  return (
    <main className="creator-library-page">
      <section className="creator-library-shell">
        <header className="creator-library-hero">
          <div>
            <p className="creator-library-kicker">Creator OS</p>
            <h1>Creator Library</h1>
            <p>See every track by release, realm, creative status, and publishing readiness.</p>
          </div>
          <div className="creator-library-hero-actions">
            <Link href="/creator">Creator Home</Link>
            <Link href="/creator/projects">Release Worlds</Link>
            <Link href="/nexus">View Nexus</Link>
          </div>
        </header>

        {error && (
          <section className="creator-library-error">
            <strong>Could not load the library.</strong>
            <p>{error.message}</p>
            <button type="button" onClick={() => refetch()}>Try again</button>
          </section>
        )}

        <section className="creator-library-summary" aria-label="Catalog summary">
          {[
            ["Total tracks", summary.total],
            ["Published", summary.published],
            ["Needs realm", summary.needsRealm],
            ["Needs audio", summary.needsAudio],
            ["Ready", summary.ready],
            ["Coming soon", summary.comingSoon],
          ].map(([label, value]) => (
            <article key={String(label)}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="creator-library-controls">
          <div className="creator-library-tabs" role="tablist" aria-label="Library view">
            {(["tracks", "releases", "realms", "publishing"] as LibraryView[]).map((item) => (
              <button
                key={item}
                type="button"
                className={view === item ? "is-active" : ""}
                onClick={() => setView(item)}
              >
                {formatLabel(item)}
              </button>
            ))}
          </div>

          <div className="creator-library-filter-grid">
            <label className="creator-library-search">
              <span>Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Track, release, mood, realm..."
              />
            </label>

            <label>
              <span>Release</span>
              <select value={releaseFilter} onChange={(event) => setReleaseFilter(event.target.value)}>
                <option value="all">All releases</option>
                {releases.map((release) => (
                  <option key={release.id} value={release.id}>{release.title}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Realm</span>
              <select value={realmFilter} onChange={(event) => setRealmFilter(event.target.value)}>
                <option value="all">All realms</option>
                {REALMS.map((realm) => (
                  <option key={realm.id} value={realm.id}>{realm.id} — {realm.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {["idea", "writing", "demo", "recording", "mixing", "mastered", "released", "archived"].map((item) => (
                  <option key={item} value={item}>{formatLabel(item)}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Publishing</span>
              <select value={publishingFilter} onChange={(event) => setPublishingFilter(event.target.value)}>
                <option value="all">All publishing states</option>
                {["published", "ready", "needs-realm", "needs-audio", "needs-access", "needs-release", "draft", "archived"].map((item) => (
                  <option key={item} value={item}>{getPublishingLabel(item)}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <section className="creator-library-empty"><h2>Loading your tracks...</h2></section>
        ) : tracks.length === 0 ? (
          <section className="creator-library-empty">
            <p className="creator-library-kicker">Empty Library</p>
            <h2>No Mongo-backed release tracks yet.</h2>
            <p>Create tracks from a release Signal Board. Static registry tracks remain playable in the Nexus, but they will not appear here until migrated into Creator OS.</p>
            <Link href="/creator/projects">Open Release Worlds</Link>
          </section>
        ) : view === "tracks" ? (
          <section className="creator-library-track-list">
            <div className="creator-library-list-heading">
              <div><span>Track</span><small>{filteredTracks.length} shown</small></div>
              <span>Release / Realm</span>
              <span>Status</span>
              <span>Publishing</span>
              <span>Actions</span>
            </div>
            {filteredTracks.map((track) => {
              const realm = getRealmMeta(track.realmId);
              const release = track.release;
              return (
                <article className="creator-library-track-row" key={track.id}>
                  <div className="creator-library-track-title">
                    <span>{String(track.trackNumber ?? 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{track.title}</strong>
                      <p>{track.bpm ? `${track.bpm} BPM` : "BPM TBD"} · {track.keySignature || "Key TBD"}</p>
                    </div>
                  </div>
                  <div>
                    <strong>{release?.title ?? "Unknown release"}</strong>
                    <p style={{ color: realm?.color }}>{realm ? `${realm.id} — ${realm.name}` : "Realm unassigned"}</p>
                  </div>
                  <div>
                    <strong>{formatLabel(track.status)}</strong>
                    <p>{formatLabel(track.playbackStatus)} · {formatLabel(track.visibility)}</p>
                  </div>
                  <div>
                    <span className={`creator-library-publish-state is-${track.publishingState}`}>
                      {getPublishingLabel(track.publishingState)}
                    </span>
                    <p>{track.nexusSortOrder === 999 ? "Auto sort" : `Sort ${track.nexusSortOrder}`}</p>
                  </div>
                  <div className="creator-library-row-actions">
                    {release && <Link href={`/releases/${release.slug}/board`}>Open Board</Link>}
                    {release && <Link href={`/releases/${release.slug}`}>Portal</Link>}
                    {track.showInNexus && <Link href="/nexus">Nexus</Link>}
                    {realm && <Link href={`/realms/${realm.id}`}>Realm</Link>}
                  </div>
                </article>
              );
            })}
            {filteredTracks.length === 0 && <div className="creator-library-empty"><h2>No tracks match these filters.</h2></div>}
          </section>
        ) : view === "releases" ? (
          <section className="creator-library-group-grid">
            {releases.map((release) => {
              const releaseTracks = filteredTracks.filter((track) => track.releaseWorldId === release.id);
              return (
                <article key={release.id} className="creator-library-group-card">
                  <div className="creator-library-group-heading">
                    <div><span>{formatLabel(release.releaseType)}</span><h2>{release.title}</h2></div>
                    <strong>{releaseTracks.length}</strong>
                  </div>
                  <p>{formatLabel(release.status)} · {formatLabel(release.visibility)}</p>
                  <div className="creator-library-mini-tracks">
                    {releaseTracks.slice(0, 8).map((track) => <span key={track.id}>{track.title}</span>)}
                    {releaseTracks.length === 0 && <span>No matching tracks</span>}
                  </div>
                  <div className="creator-library-card-actions">
                    <Link href={`/releases/${release.slug}/board`}>Signal Board</Link>
                    <Link href={`/releases/${release.slug}`}>Portal</Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : view === "realms" ? (
          <section className="creator-library-group-grid">
            {REALMS.map((realm) => {
              const realmTracks = filteredTracks.filter((track) => track.realmId === realm.id);
              return (
                <article key={realm.id} className="creator-library-group-card" style={{ borderColor: `${realm.color}66` }}>
                  <div className="creator-library-group-heading">
                    <div><span style={{ color: realm.color }}>{realm.id}</span><h2>{realm.name}</h2></div>
                    <strong>{realmTracks.length}</strong>
                  </div>
                  <div className="creator-library-mini-tracks">
                    {realmTracks.slice(0, 10).map((track) => <span key={track.id}>{track.title}</span>)}
                    {realmTracks.length === 0 && <span>No matching tracks</span>}
                  </div>
                  <div className="creator-library-card-actions"><Link href={`/realms/${realm.id}`}>Open Realm</Link></div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="creator-library-publishing-columns">
            {["ready", "needs-realm", "needs-audio", "needs-release", "published"].map((state) => {
              const stateTracks = filteredTracks.filter((track) => track.publishingState === state);
              return (
                <article key={state}>
                  <header><span>{getPublishingLabel(state)}</span><strong>{stateTracks.length}</strong></header>
                  <div>
                    {stateTracks.map((track) => (
                      <Link key={track.id} href={track.release ? `/releases/${track.release.slug}/board` : "/creator/projects"}>
                        <strong>{track.title}</strong>
                        <small>{track.release?.title ?? "Unknown release"}</small>
                      </Link>
                    ))}
                    {stateTracks.length === 0 && <p>No tracks here.</p>}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="creator-library-footer">
          <p>Static musicRegistry tracks remain live as legacy seed content. Creator Library shows Mongo-backed tracks created through Release Worlds and Signal Boards.</p>
          <span>Last refresh: {formatDate(new Date().toISOString())}</span>
        </footer>
      </section>
    </main>
  );
}
