"use client";

import Link from "next/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { upload } from "@vercel/blob/client";
import { useSession } from "next-auth/react";
import { useMemo, useRef, useState } from "react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
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

    myCatalogTracks {
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
      artworkUrl
      releaseCoverArtUrl
      visibility
      accessTier
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



const CREATE_CATALOG_TRACK = gql`
  mutation CreateCatalogTrack($input: ReleaseTrackInput!) {
    createReleaseTrack(input: $input) {
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
      artworkUrl
      releaseCoverArtUrl
      visibility
      accessTier
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



const RENAME_LIBRARY_TRACK = gql`
  mutation RenameLibraryTrack($id: ID!, $input: UpdateReleaseTrackInput!) {
    updateReleaseTrack(id: $id, input: $input) {
      id
      title
      slug
      releaseWorldId
      updatedAt
    }
  }
`;

const DELETE_CATALOG_TRACK = gql`
  mutation DeleteCatalogTrack($trackId: ID!) {
    deleteCatalogTrack(trackId: $trackId) {
      id
      title
    }
  }
`;

const ATTACH_TRACK_TO_RELEASE_WORLD = gql`
  mutation AttachTrackToReleaseWorld($trackId: ID!, $releaseWorldId: ID!) {
    attachTrackToReleaseWorld(trackId: $trackId, releaseWorldId: $releaseWorldId) {
      id
      releaseWorldId
      title
      trackNumber
      status
      visibility
      playbackStatus
      updatedAt
    }
  }
`;

const CREATE_SINGLE_FROM_TRACK = gql`
  mutation CreateSingleFromTrack($trackId: ID!) {
    createSingleFromTrack(trackId: $trackId) {
      id
      title
      slug
      releaseType
      status
      visibility
      currentFocus
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


type OrganizeResult = {
  title: string;
  message: string;
  boardHref: string;
} | null;

type ReleaseTrack = {
  id: string;
  releaseWorldId?: string | null;
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
  artworkUrl?: string | null;
  releaseCoverArtUrl?: string | null;
  visibility: string;
  accessTier?: string | null;
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
  if (!track.releaseWorldId) return "unsorted";
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
    unsorted: "Unsorted",
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


function getUploadTitle(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Untitled track";
}

function getSafeFileName(fileName: string) {
  return (
    fileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "audio"
  );
}

function isSupportedAudioFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    file.type.startsWith("audio/") ||
    ["mp3", "wav", "flac", "m4a", "aac", "mp4"].includes(extension ?? "")
  );
}

export default function CreatorLibraryPage() {
  const { status } = useSession();
  const { playOrToggleTrack, currentTrack, isPlaying } = useMusicPlayer();
  const [view, setView] = useState<LibraryView>("tracks");
  const [search, setSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("all");
  const [realmFilter, setRealmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishingFilter, setPublishingFilter] = useState("all");
  const [selectedAudioFiles, setSelectedAudioFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploadingSongs, setIsUploadingSongs] = useState(false);
  const [isDraggingSongs, setIsDraggingSongs] = useState(false);
  const [organizingTrackId, setOrganizingTrackId] = useState<string | null>(null);
  const [organizeMessage, setOrganizeMessage] = useState("");
  const [organizeResult, setOrganizeResult] = useState<OrganizeResult>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [libraryActionMessage, setLibraryActionMessage] = useState("");
  const [busyTrackId, setBusyTrackId] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [createCatalogTrack] = useMutation(CREATE_CATALOG_TRACK);
  const [renameLibraryTrack] = useMutation(RENAME_LIBRARY_TRACK);
  const [deleteCatalogTrack] = useMutation(DELETE_CATALOG_TRACK);
  const [attachTrackToReleaseWorld] = useMutation(ATTACH_TRACK_TO_RELEASE_WORLD);
  const [createSingleFromTrack] = useMutation(CREATE_SINGLE_FROM_TRACK);

  const { data, loading, error, refetch } = useQuery(CREATOR_LIBRARY_QUERY, {
    skip: status !== "authenticated",
    fetchPolicy: "cache-and-network",
  });

  const releases: ReleaseWorld[] = data?.myReleaseWorlds ?? [];
  const tracks: ReleaseTrack[] = data?.myCatalogTracks ?? [];

  const releaseMap = useMemo(
    () => new Map(releases.map((release) => [release.id, release])),
    [releases],
  );

  const organizingTrack = useMemo(
    () => tracks.find((track) => track.id === organizingTrackId) ?? null,
    [tracks, organizingTrackId],
  );

  const availableReleaseWorlds = useMemo(
    () => releases.filter((release) => release.status !== "archived"),
    [releases],
  );

  const enrichedTracks = useMemo(
    () =>
      tracks.map((track) => {
        const release = track.releaseWorldId ? releaseMap.get(track.releaseWorldId) ?? null : null;
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
        (releaseFilter === "all" ||
          (releaseFilter === "unsorted" ? !track.releaseWorldId : track.releaseWorldId === releaseFilter)) &&
        (realmFilter === "all" || String(track.realmId) === realmFilter) &&
        (statusFilter === "all" || track.status === statusFilter) &&
        (publishingFilter === "all" || track.publishingState === publishingFilter)
      );
    });
  }, [enrichedTracks, search, releaseFilter, realmFilter, statusFilter, publishingFilter]);

  const summary = useMemo(() => {
    return {
      total: tracks.length,
      unsorted: enrichedTracks.filter((track) => !track.releaseWorldId).length,
      published: enrichedTracks.filter((track) => track.showInNexus).length,
      needsRealm: enrichedTracks.filter((track) => track.releaseWorldId && track.publishingState === "needs-realm").length,
      needsAudio: enrichedTracks.filter((track) => track.releaseWorldId && track.publishingState === "needs-audio").length,
      ready: enrichedTracks.filter((track) => track.publishingState === "ready").length,
    };
  }, [tracks.length, enrichedTracks]);


  function handleAudioSelection(files: FileList | File[] | null) {
    const incomingFiles = Array.from(files ?? []).filter(isSupportedAudioFile);

    if (incomingFiles.length === 0) {
      setUploadMessage("No supported audio files were added.");
      return;
    }

    setSelectedAudioFiles((current) => {
      const seen = new Set(
        current.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
      );

      const additions = incomingFiles.filter((file) => {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const combined = [...current, ...additions].slice(0, 20);
      const addedCount = combined.length - current.length;

      if (current.length + additions.length > 20) {
        setUploadMessage(
          `Added ${addedCount} song${addedCount === 1 ? "" : "s"}. COSMIC intake holds up to 20 at a time.`,
        );
      } else {
        setUploadMessage(
          `${combined.length} song${combined.length === 1 ? "" : "s"} ready. Choose Songs again or drag in more from another folder.`,
        );
      }

      return combined;
    });
  }

  function removeSelectedAudioFile(indexToRemove: number) {
    setSelectedAudioFiles((current) => {
      const next = current.filter((_, index) => index !== indexToRemove);
      setUploadMessage(
        next.length
          ? `${next.length} song${next.length === 1 ? "" : "s"} ready for Unsorted.`
          : "Queue cleared. Add songs whenever you are ready.",
      );
      return next;
    });
  }

  function clearSelectedAudioFiles() {
    setSelectedAudioFiles([]);
    setUploadMessage("Queue cleared. Add songs whenever you are ready.");
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  function scrollToIntake() {
    document.getElementById("intake")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleDropSongs(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingSongs(false);
    handleAudioSelection(event.dataTransfer.files);
  }

  function getLibraryPlayerTrack(track: ReleaseTrack) {
    const realm = getRealmMeta(track.realmId);
    const trackUrl = track.audioUrl?.trim() || track.previewAudioUrl?.trim() || "";

    return {
      id: `library-${track.id}`,
      trackTitle: track.title,
      artist: "COSMIC Creator",
      realmId: realm?.id ?? 0,
      realmName: realm?.name ?? "Creator Library",
      realmColor: realm?.color ?? "#EEF3FA",
      trackUrl,
      artworkUrl:
        track.artworkUrl?.trim() ||
        track.releaseCoverArtUrl?.trim() ||
        undefined,
    };
  }

  function playLibraryTrack(track: ReleaseTrack) {
    const playerTrack = getLibraryPlayerTrack(track);
    if (!playerTrack.trackUrl) return;

    const queue = filteredTracks
      .filter((candidate) => hasAudio(candidate))
      .map(getLibraryPlayerTrack)
      .filter((candidate) => Boolean(candidate.trackUrl));

    void playOrToggleTrack(playerTrack, queue, {
      source: "creator-library",
      label: releaseFilter === "unsorted" ? "Unsorted Library" : "Creator Library",
    });
  }

  async function handleUploadSongs() {
    if (selectedAudioFiles.length === 0 || isUploadingSongs) return;

    setIsUploadingSongs(true);
    let createdCount = 0;

    try {
      for (const [index, file] of selectedAudioFiles.entries()) {
        setUploadMessage(
          `Uploading ${index + 1} of ${selectedAudioFiles.length}: ${file.name}`,
        );

        const safeFileName = getSafeFileName(file.name);
        const pathname = `catalog-audio/${Date.now()}-${index}-${safeFileName}`;

        const uploadResult = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: JSON.stringify({
            kind: "catalog-audio",
            usage: "creator-library-intake",
            originalFileName: file.name,
          }),
        });

        await createCatalogTrack({
          variables: {
            input: {
              title: getUploadTitle(file.name),
              status: "demo",
              audioUrl: uploadResult.url,
              visibility: "private",
              accessTier: "public",
              playbackStatus: "playable",
              isPublic: false,
              realmId: null,
              showInNexus: false,
            },
          },
        });

        createdCount += 1;
      }

      await refetch();
      setSelectedAudioFiles([]);
      if (audioInputRef.current) audioInputRef.current.value = "";
      setReleaseFilter("unsorted");
      setView("tracks");
      setUploadMessage(
        `${createdCount} song${createdCount === 1 ? "" : "s"} added to Unsorted. Nothing was published or assigned to a project.`,
      );
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Unknown upload error.";
      await refetch();
      setUploadMessage(
        `${createdCount} song${createdCount === 1 ? "" : "s"} saved before the upload stopped. ${message}`,
      );
    } finally {
      setIsUploadingSongs(false);
    }
  }



  async function handleRenameUnsortedTrack(track: ReleaseTrack) {
    if (track.releaseWorldId || busyTrackId) return;

    const nextTitle = window.prompt("Rename this Library track", track.title);
    if (nextTitle === null) return;

    const title = nextTitle.trim();
    if (!title || title === track.title) return;

    try {
      setBusyTrackId(track.id);
      setLibraryActionMessage(`Renaming ${track.title}...`);

      await renameLibraryTrack({
        variables: {
          id: track.id,
          input: { title },
        },
      });

      await refetch();
      setLibraryActionMessage(`Renamed to ${title}.`);
    } catch (renameError) {
      setLibraryActionMessage(
        renameError instanceof Error
          ? renameError.message
          : "Could not rename this track.",
      );
    } finally {
      setBusyTrackId(null);
    }
  }

  async function handleRemoveUnsortedTrack(track: ReleaseTrack) {
    if (track.releaseWorldId || busyTrackId) return;

    const confirmed = window.confirm(
      `Remove "${track.title}" from your Library?\n\nThis permanently deletes the Unsorted track record and attempts to remove its uploaded audio from COSMIC storage. This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setBusyTrackId(track.id);
      setLibraryActionMessage(`Removing ${track.title}...`);

      if (currentTrack?.id === `library-${track.id}` && isPlaying) {
        const playerTrack = getLibraryPlayerTrack(track);
        void playOrToggleTrack(playerTrack);
      }

      await deleteCatalogTrack({
        variables: { trackId: track.id },
      });

      await refetch();
      setLibraryActionMessage(`${track.title} was removed from Unsorted.`);
    } catch (deleteError) {
      setLibraryActionMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not remove this track.",
      );
    } finally {
      setBusyTrackId(null);
    }
  }

  function openOrganizer(track: ReleaseTrack) {
    setOrganizingTrackId(track.id);
    setOrganizeMessage("");
    setOrganizeResult(null);
  }

  function closeOrganizer() {
    if (isOrganizing) return;
    setOrganizingTrackId(null);
    setOrganizeMessage("");
    setOrganizeResult(null);
  }

  async function handleAttachToReleaseWorld(release: ReleaseWorld) {
    if (!organizingTrack || isOrganizing) return;

    setIsOrganizing(true);
    setOrganizeMessage(`Adding ${organizingTrack.title} to ${release.title}...`);
    setOrganizeResult(null);

    try {
      await attachTrackToReleaseWorld({
        variables: {
          trackId: organizingTrack.id,
          releaseWorldId: release.id,
        },
      });

      await refetch();
      setOrganizeMessage("");
      setOrganizeResult({
        title: `${organizingTrack.title} is organized.`,
        message: `Added to ${release.title}. It is now part of that Release World and will appear on its Signal Board.`,
        boardHref: `/releases/${release.slug}/board`,
      });
    } catch (organizeError) {
      setOrganizeMessage(
        organizeError instanceof Error
          ? organizeError.message
          : "Could not add this track to the Release World.",
      );
    } finally {
      setIsOrganizing(false);
    }
  }

  async function handleCreateSingleFromTrack() {
    if (!organizingTrack || isOrganizing) return;

    setIsOrganizing(true);
    setOrganizeMessage(`Creating a Single for ${organizingTrack.title}...`);
    setOrganizeResult(null);

    try {
      const result = await createSingleFromTrack({
        variables: {
          trackId: organizingTrack.id,
        },
      });

      const single = result.data?.createSingleFromTrack;

      if (!single?.slug) {
        throw new Error("The Single was created, but COSMIC could not resolve its Signal Board.");
      }

      await refetch();
      setOrganizeMessage("");
      setOrganizeResult({
        title: `${single.title} is now a Single.`,
        message: "COSMIC created a private draft Release World and attached the same canonical track — no duplicate audio or song record.",
        boardHref: `/releases/${single.slug}/board`,
      });
    } catch (organizeError) {
      setOrganizeMessage(
        organizeError instanceof Error
          ? organizeError.message
          : "Could not create a Single from this track.",
      );
    } finally {
      setIsOrganizing(false);
    }
  }

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
          <Link href="/auth?callbackUrl=/creator/library">Sign in to COSMIC</Link>
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
            <p>Capture songs first, organize them when the direction becomes clear, then develop the ones that belong to a Single, EP, Album, or other Release World.</p>
          </div>
          <div className="creator-library-hero-actions">
            <button type="button" onClick={scrollToIntake}>+ Add Music</button>
            <Link href="/creator/projects">Release Worlds</Link>
            <Link href="/nexus">View Nexus</Link>
            <Link href="/creator">Creator Home</Link>
          </div>
        </header>


        <section className="creator-library-intake" id="intake">
          <div className="creator-library-intake-copy">
            <p className="creator-library-kicker">Capture</p>
            <h2>Put the music in COSMIC first.</h2>
            <p>
              Upload rough drafts, demos, or finished songs without choosing a Release World or Realm yet.
              Add files from one folder, reopen the picker for another folder, or drag songs in from Finder.
            </p>
          </div>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.m4a,.aac"
            multiple
            hidden
            onChange={(event) => {
              handleAudioSelection(event.target.files);
              event.currentTarget.value = "";
            }}
          />

          <div
            className={`creator-library-dropzone${isDraggingSongs ? " is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDraggingSongs(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingSongs(true);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setIsDraggingSongs(false);
            }}
            onDrop={handleDropSongs}
          >
            <strong>Drop songs here</strong>
            <span>MP3 · WAV · FLAC · M4A · AAC</span>
            <button
              type="button"
              className="is-primary"
              onClick={() => audioInputRef.current?.click()}
              disabled={isUploadingSongs}
            >
              {selectedAudioFiles.length > 0 ? "Add More Songs" : "Choose Songs"}
            </button>
          </div>

          {selectedAudioFiles.length > 0 && (
            <div className="creator-library-upload-queue">
              <div className="creator-library-upload-queue-heading">
                <div>
                  <span>Upload Queue</span>
                  <strong>{selectedAudioFiles.length} ready</strong>
                </div>
                <button type="button" onClick={clearSelectedAudioFiles} disabled={isUploadingSongs}>
                  Clear
                </button>
              </div>

              <div className="creator-library-upload-files">
                {selectedAudioFiles.map((file, index) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{getUploadTitle(file.name)}</strong>
                      <small>{file.name}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedAudioFile(index)}
                      disabled={isUploadingSongs}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="creator-library-upload-queue-actions">
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => void handleUploadSongs()}
                  disabled={isUploadingSongs}
                >
                  {isUploadingSongs
                    ? "Uploading..."
                    : `Add ${selectedAudioFiles.length} to Unsorted`}
                </button>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploadingSongs || selectedAudioFiles.length >= 20}
                >
                  + Add More
                </button>
              </div>
            </div>
          )}

          {uploadMessage && (
            <div className="creator-library-intake-status" aria-live="polite">
              <strong>{uploadMessage}</strong>
            </div>
          )}
        </section>

        {error && (
          <section className="creator-library-error">
            <strong>Could not load the library.</strong>
            <p>{error.message}</p>
            <button type="button" onClick={() => refetch()}>Try again</button>
          </section>
        )}

        {libraryActionMessage && (
          <div className="creator-library-action-message" role="status">
            {libraryActionMessage}
          </div>
        )}

        <section className="creator-library-summary" aria-label="Catalog summary">
          {[
            ["Total tracks", summary.total],
            ["Unsorted", summary.unsorted],
            ["Published", summary.published],
            ["Needs realm", summary.needsRealm],
            ["Needs audio", summary.needsAudio],
            ["Ready", summary.ready],
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
                {item === "publishing" ? "Readiness" : formatLabel(item)}
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
                <option value="all">All projects</option>
                <option value="unsorted">Unsorted / No project</option>
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
              <span>Readiness</span>
              <select value={publishingFilter} onChange={(event) => setPublishingFilter(event.target.value)}>
                <option value="all">All readiness states</option>
                {["unsorted", "published", "ready", "needs-realm", "needs-audio", "needs-access", "needs-release", "draft", "archived"].map((item) => (
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
            <h2>Your catalog is ready for its first track.</h2>
            <p>Upload a rough draft, demo, or finished song. You can decide later whether it becomes a Single, joins an EP or Album, or stays in your private catalog.</p>
            <button type="button" onClick={() => audioInputRef.current?.click()}>Upload your first song</button>
          </section>
        ) : view === "tracks" ? (
          <section className="creator-library-track-list">
            <div className="creator-library-list-heading">
              <div><span>Signal</span><small>{filteredTracks.length} shown</small></div>
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
                    <div className="creator-library-track-art">
                      {(track.artworkUrl || track.releaseCoverArtUrl || release?.coverArtUrl) ? (
                        <img
                          src={track.artworkUrl || track.releaseCoverArtUrl || release?.coverArtUrl || ""}
                          alt=""
                        />
                      ) : (
                        <span>{String(track.trackNumber ?? 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    <div>
                      <strong>{track.title}</strong>
                      <p>{track.bpm ? `${track.bpm} BPM` : "BPM TBD"} · {track.keySignature || "Key TBD"}</p>
                      <small className={track.artworkUrl ? "has-track-art" : "uses-release-art"}>
                        {track.artworkUrl ? "Track artwork" : release?.coverArtUrl ? "Release artwork" : "Catalog track"}
                      </small>
                    </div>
                  </div>
                  <div>
                    <strong className={!release ? "creator-library-location-unsorted" : undefined}>
                      {release?.title ?? "Unsorted"}
                    </strong>
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
                    {release ? (
                      <Link className="is-primary" href={`/releases/${release.slug}/board`}>Open Board</Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="is-primary"
                          onClick={() => openOrganizer(track)}
                          disabled={busyTrackId === track.id}
                        >
                          Organize
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRenameUnsortedTrack(track)}
                          disabled={busyTrackId === track.id}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="is-destructive"
                          onClick={() => void handleRemoveUnsortedTrack(track)}
                          disabled={busyTrackId === track.id}
                        >
                          Remove
                        </button>
                      </>
                    )}
                    {(track.audioUrl || track.previewAudioUrl) && (
                      <button
                        type="button"
                        className={currentTrack?.id === `library-${track.id}` ? "is-current-signal" : undefined}
                        onClick={() => playLibraryTrack(track)}
                      >
                        {currentTrack?.id === `library-${track.id}` && isPlaying
                          ? "Pause"
                          : track.playbackStatus === "preview"
                            ? "Preview"
                            : "Play"}
                      </button>
                    )}
                    {release && <Link href={`/releases/${release.slug}`}>Portal</Link>}
                    {realm && <Link href={`/realms/${realm.id}`}>Realm</Link>}
                    {track.showInNexus && <Link href="/nexus">Nexus</Link>}
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
                  {release.coverArtUrl && (
                    <Link className="creator-library-release-art" href={`/releases/${release.slug}/board`}>
                      <img src={release.coverArtUrl} alt="" />
                    </Link>
                  )}
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
          <>
            <section className="creator-library-readiness-guide">
              <div>
                <p className="creator-library-kicker">Release Readiness</p>
                <h2>See where the music is — not where it has to go.</h2>
                <p>
                  Unsorted songs can stay private as long as you want. Readiness only matters once a track
                  becomes part of a Release World and you decide to move it toward listeners or Nexus.
                </p>
              </div>
              <div className="creator-library-readiness-flow" aria-label="Release readiness path">
                {["Unsorted", "In Project", "Developing", "Ready", "Nexus"].map((step, index) => (
                  <span key={step}>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    {step}
                  </span>
                ))}
              </div>
            </section>

            <section className="creator-library-publishing-columns">
            {["unsorted", "ready", "needs-realm", "needs-audio", "needs-release", "published"].map((state) => {
              const stateTracks = filteredTracks.filter((track) => track.publishingState === state);
              return (
                <article key={state}>
                  <header><span>{getPublishingLabel(state)}</span><strong>{stateTracks.length}</strong></header>
                  <div>
                    {stateTracks.map((track) => (
                      <Link key={track.id} href={track.release ? `/releases/${track.release.slug}/board` : "/creator/projects"}>
                        <strong>{track.title}</strong>
                        <small>{track.release?.title ?? "Unsorted"}</small>
                      </Link>
                    ))}
                    {stateTracks.length === 0 && <p>No tracks here.</p>}
                  </div>
                </article>
              );
            })}
            </section>
          </>
        )}



        {organizingTrack && (
          <div
            className="creator-library-organize-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeOrganizer();
            }}
          >
            <section
              className="creator-library-organize-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="creator-library-organize-title"
            >
              <div className="creator-library-organize-heading">
                <div>
                  <p className="creator-library-kicker">Organize</p>
                  <h2 id="creator-library-organize-title">{organizingTrack.title}</h2>
                  <p>
                    Keep it Unsorted, place it in an existing Release World, or turn it directly into a private draft Single.
                  </p>
                </div>
                <button type="button" onClick={closeOrganizer} disabled={isOrganizing} aria-label="Close organizer">
                  ×
                </button>
              </div>

              {organizeResult ? (
                <div className="creator-library-organize-success">
                  <span>Ready to develop</span>
                  <h3>{organizeResult.title}</h3>
                  <p>{organizeResult.message}</p>
                  <div>
                    <Link className="is-primary" href={organizeResult.boardHref}>
                      Open Signal Board
                    </Link>
                    <button type="button" onClick={closeOrganizer}>
                      Back to Library
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="creator-library-organize-single">
                    <div>
                      <span>Fast path</span>
                      <strong>Make this a Single</strong>
                      <p>Create a private Single Release World and use this exact track as Track 1.</p>
                    </div>
                    <button
                      type="button"
                      className="is-primary"
                      disabled={isOrganizing}
                      onClick={() => void handleCreateSingleFromTrack()}
                    >
                      Create Single
                    </button>
                  </div>

                  <div className="creator-library-organize-divider">
                    <span>or add to an existing project</span>
                  </div>

                  <div className="creator-library-organize-projects">
                    {availableReleaseWorlds.map((release) => (
                      <button
                        key={release.id}
                        type="button"
                        disabled={isOrganizing}
                        onClick={() => void handleAttachToReleaseWorld(release)}
                      >
                        <div>
                          {release.coverArtUrl ? (
                            <img src={release.coverArtUrl} alt="" />
                          ) : (
                            <span>{formatLabel(release.releaseType).slice(0, 2)}</span>
                          )}
                        </div>
                        <section>
                          <small>{formatLabel(release.releaseType)} · {formatLabel(release.status)}</small>
                          <strong>{release.title}</strong>
                          <span>{formatLabel(release.visibility)}</span>
                        </section>
                        <em>+</em>
                      </button>
                    ))}

                    {availableReleaseWorlds.length === 0 && (
                      <div className="creator-library-organize-empty">
                        <strong>No active Release Worlds yet.</strong>
                        <p>Create a Single from this song, or keep it Unsorted for now.</p>
                      </div>
                    )}
                  </div>

                  <div className="creator-library-organize-footer">
                    <button type="button" onClick={closeOrganizer} disabled={isOrganizing}>
                      Keep Unsorted
                    </button>
                    {organizeMessage && <p role="status">{organizeMessage}</p>}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

      </section>
    </main>
  );
}