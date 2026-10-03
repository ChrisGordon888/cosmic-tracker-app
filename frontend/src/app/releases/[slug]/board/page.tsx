"use client";

import type { DragEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { upload } from "@vercel/blob/client";
import "@/styles/signalBoard.css";

import { getTrackInputFromForm, getTrackUpdateFromForms } from "@/lib/trackFormInput";
import WorkspaceTour from "@/components/signal-board/WorkspaceTour";
import TrackWorkspace from "@/components/signal-board/TrackWorkspace";
import ReleaseAssetsPanel from "@/components/signal-board/ReleaseAssetsPanel";
import StudioBoardWorkspace from "@/components/signal-board/StudioBoardWorkspace";
import { realmFinderRealms, realmFinderQuestions, getRealmFinderResult } from "@/lib/creatorRealmFinder";
import type { ArtifactColor, ArtifactSize, ReleaseWorld, ReleaseTrack, TrackForm, ReleaseAsset, AssetForm, HookTargetOption, PortalSettings, BoardArtifact, StoredBoardState, MongoBoardArtifact, PublishSignalCheck } from "@/components/signal-board/types";

const STORAGE_KEY_PREFIX = "cosmic:release-signal-board";

const GET_RELEASE_WORLD_BY_SLUG = gql`
  query GetReleaseWorldBySlug($slug: String!) {
    getMyReleaseWorldBySlug(slug: $slug) {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      oneLineSummary
      story
      currentFocus
      secondFocus
      fullDropDate
      coverArtUrl
      coverAssetId
      updatedAt
      lastOpenedAt
    }
  }
`;

const GET_BOARD_ARTIFACTS = gql`
  query GetBoardArtifacts($releaseWorldId: ID!) {
    getBoardArtifacts(releaseWorldId: $releaseWorldId) {
      id
      kind
      eyebrow
      title
      body
      meta
      href
      connectedTrackSlug
      position {
        x
        y
        rotate
      }
      style {
        color
        size
        layer
      }
      isGenerated
      isUserCreated
      isPublic
      pageSection
      pageOrder
    }
  }
`;

const SAVE_BOARD_ARTIFACTS = gql`
  mutation SaveBoardArtifacts(
    $releaseWorldId: ID!
    $artifacts: [BoardArtifactInput!]!
  ) {
    saveBoardArtifacts(releaseWorldId: $releaseWorldId, artifacts: $artifacts) {
      id
      kind
      eyebrow
      title
      body
      meta
      href
      connectedTrackSlug
      position {
        x
        y
        rotate
      }
      style {
        color
        size
        layer
      }
      isGenerated
      isUserCreated
      isPublic
      pageSection
      pageOrder
    }
  }
`;

const UPDATE_RELEASE_WORLD = gql`
  mutation UpdateReleaseWorld($id: ID!, $input: UpdateReleaseWorldInput!) {
    updateReleaseWorld(id: $id, input: $input) {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      oneLineSummary
      story
      currentFocus
      secondFocus
      fullDropDate
      coverArtUrl
      coverAssetId
      updatedAt
      lastOpenedAt
    }
  }
`;

const GET_RELEASE_TRACKS = gql`
  query GetReleaseTracks($releaseWorldId: ID!) {
    getReleaseTracks(releaseWorldId: $releaseWorldId) {
      id
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      hook
      notes
      audioUrl
      previewAudioUrl
      platformUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      isFocusTrack
      isSecondFocus
      isPublic
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      nexusReviewStatus
      nexusSubmittedAt
      nexusReviewedAt
      nexusReviewNotes
      realmFinderSuggestedRealmId
      realmFinderSecondaryRealmId
      realmFinderTraceRealmId
      realmFinderAlignment
      realmFinderSignals
      realmFinderSummary
      realmFinderDominantSignal
      realmFinderExplanation
      realmFinderScores { realm303 realm202 realm101 realm55 realm44 realm0 }
      realmFinderVersion
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const CREATE_RELEASE_TRACK = gql`
  mutation CreateReleaseTrack($input: ReleaseTrackInput!) {
    createReleaseTrack(input: $input) {
      id
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      hook
      notes
      audioUrl
      previewAudioUrl
      platformUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      isFocusTrack
      isSecondFocus
      isPublic
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      nexusReviewStatus
      nexusSubmittedAt
      nexusReviewedAt
      nexusReviewNotes
      realmFinderSuggestedRealmId
      realmFinderSecondaryRealmId
      realmFinderTraceRealmId
      realmFinderAlignment
      realmFinderSignals
      realmFinderSummary
      realmFinderDominantSignal
      realmFinderExplanation
      realmFinderScores { realm303 realm202 realm101 realm55 realm44 realm0 }
      realmFinderVersion
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const UPDATE_RELEASE_TRACK = gql`
  mutation UpdateReleaseTrack($id: ID!, $input: UpdateReleaseTrackInput!) {
    updateReleaseTrack(id: $id, input: $input) {
      id
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      hook
      notes
      audioUrl
      previewAudioUrl
      platformUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      isFocusTrack
      isSecondFocus
      isPublic
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      nexusReviewStatus
      nexusSubmittedAt
      nexusReviewedAt
      nexusReviewNotes
      realmFinderSuggestedRealmId
      realmFinderSecondaryRealmId
      realmFinderTraceRealmId
      realmFinderAlignment
      realmFinderSignals
      realmFinderSummary
      realmFinderDominantSignal
      realmFinderExplanation
      realmFinderScores { realm303 realm202 realm101 realm55 realm44 realm0 }
      realmFinderVersion
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const SUBMIT_TRACK_FOR_NEXUS_REVIEW = gql`
  mutation SubmitTrackForNexusReview($trackId: ID!) {
    submitTrackForNexusReview(trackId: $trackId) {
      id
      title
      slug
      trackNumber
      role
      status
      bpm
      keySignature
      mood
      hook
      notes
      audioUrl
      previewAudioUrl
      platformUrl
      visibility
      playbackStatus
      dropDate
      unlockDate
      isFocusTrack
      isSecondFocus
      isPublic
      realmId
      showInNexus
      nexusRole
      isRealmAnchor
      isPublicPick
      nexusSortOrder
      nexusReviewStatus
      nexusSubmittedAt
      nexusReviewedAt
      nexusReviewNotes
      realmFinderSuggestedRealmId
      realmFinderSecondaryRealmId
      realmFinderTraceRealmId
      realmFinderAlignment
      realmFinderSignals
      realmFinderSummary
      realmFinderDominantSignal
      realmFinderExplanation
      realmFinderScores { realm303 realm202 realm101 realm55 realm44 realm0 }
      realmFinderVersion
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const DELETE_RELEASE_TRACK = gql`
  mutation DeleteReleaseTrack($id: ID!) {
    deleteReleaseTrack(id: $id) {
      id
      title
      slug
      trackNumber
      role
      status
      isFocusTrack
      isSecondFocus
    }
  }
`;

const GET_RELEASE_ASSETS = gql`
  query GetReleaseAssets($releaseWorldId: ID!) {
    getReleaseAssets(releaseWorldId: $releaseWorldId) {
      id
      ownerId
      releaseWorldId
      trackId
      boardArtifactId
      kind
      usage
      title
      description
      url
      fileName
      mimeType
      size
      isPublic
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const CREATE_RELEASE_ASSET = gql`
  mutation CreateReleaseAsset($input: ReleaseAssetInput!) {
    createReleaseAsset(input: $input) {
      id
      ownerId
      releaseWorldId
      trackId
      boardArtifactId
      kind
      usage
      title
      description
      url
      fileName
      mimeType
      size
      isPublic
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const DELETE_RELEASE_ASSET = gql`
  mutation DeleteReleaseAsset($id: ID!) {
    deleteReleaseAsset(id: $id) {
      id
      ownerId
      releaseWorldId
      trackId
      boardArtifactId
      kind
      usage
      title
      description
      url
      fileName
      mimeType
      size
      isPublic
      createdAt
      updatedAt
      lastOpenedAt
    }
  }
`;

const colorOptions: Array<{ value: ArtifactColor; label: string }> = [
    { value: "cream", label: "Cream" },
    { value: "sky", label: "Sky" },
    { value: "violet", label: "Violet" },
    { value: "gold", label: "Gold" },
    { value: "rose", label: "Rose" },
    { value: "mint", label: "Mint" },
    { value: "graphite", label: "Graphite" },
];

const sizeOptions: Array<{ value: ArtifactSize; label: string }> = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Feature" },
];

const layerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const pageSectionOptions = [
    { value: "story", label: "Story" },
    { value: "track", label: "Track Note" },
    { value: "visual", label: "Visual" },
    { value: "rollout", label: "Rollout" },
    { value: "quote", label: "Quote / Hook" },
    { value: "asset", label: "Asset" },
];

const trackRoleOptions = [
    { value: "unknown", label: "Unknown" },
    { value: "intro", label: "Intro" },
    { value: "lead-single", label: "Lead Single" },
    { value: "second-single", label: "Second Single" },
    { value: "focus-track", label: "Focus Track" },
    { value: "deep-cut", label: "Deep Cut" },
    { value: "interlude", label: "Interlude" },
    { value: "outro", label: "Outro" },
    { value: "bonus", label: "Bonus" },
];

const trackStatusOptions = [
    { value: "idea", label: "Idea" },
    { value: "writing", label: "Writing" },
    { value: "demo", label: "Demo" },
    { value: "recording", label: "Recording" },
    { value: "mixing", label: "Mixing" },
    { value: "mastered", label: "Mastered" },
    { value: "released", label: "Released" },
    { value: "archived", label: "Archived" },
];

const trackVisibilityOptions = [
    { value: "private", label: "Private" },
    { value: "listed", label: "Listed" },
    { value: "public", label: "Public" },
];

const playbackStatusOptions = [
    { value: "locked", label: "Locked" },
    { value: "preview", label: "Preview" },
    { value: "playable", label: "Playable" },
    { value: "coming-soon", label: "Coming Soon" },
];

const realmPublishingOptions = [
    { value: "", label: "No Realm" },
    { value: "303", label: "303 — Fractured Frontier" },
    { value: "202", label: "202 — The Veil" },
    { value: "101", label: "101 — Moonlit Roads" },
    { value: "55", label: "55 — Skybound City" },
    { value: "44", label: "44 — Astral Bazaar" },
    { value: "0", label: "0 — InterSiddhi" },
];



const assetUsageOptions = [
    { value: "cover", label: "Cover Art" },
    { value: "track-audio", label: "Track Audio" },
    { value: "track-artwork", label: "Track Artwork" },
    { value: "visual-reference", label: "Visual Reference" },
    { value: "promo", label: "Promo Asset" },
    { value: "canvas", label: "Canvas Clip" },
    { value: "lyric", label: "Lyric Asset" },
    { value: "other", label: "Other" },
];

const assetKindOptions = [
    { value: "cover", label: "Cover" },
    { value: "audio", label: "Audio" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "document", label: "Document" },
    { value: "other", label: "Other" },
];

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function makeId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function getStorageKey(slug: string) {
    return `${STORAGE_KEY_PREFIX}:${slug}`;
}

function getProjectSummary(releaseWorld?: ReleaseWorld | null) {
    return (
        releaseWorld?.oneLineSummary?.trim() ||
        releaseWorld?.story?.trim() ||
        "The center of this project world. Add hooks, visuals, notes, portals, rollout ideas, and campaign signals around it."
    );
}

function getProjectFocusOptions(releaseWorld?: ReleaseWorld | null) {
    const options: Array<{ slug: string; title: string }> = [];

    if (releaseWorld?.currentFocus?.trim()) {
        options.push({
            slug: "current-focus",
            title: releaseWorld.currentFocus.trim(),
        });
    }

    if (releaseWorld?.secondFocus?.trim()) {
        options.push({
            slug: "second-focus",
            title: releaseWorld.secondFocus.trim(),
        });
    }

    if (options.length === 0) {
        options.push({
            slug: "project-hook",
            title: "Project Hook",
        });
    }

    return options;
}

function getEmptyTrackForm(nextTrackNumber = 1): TrackForm {
    return {
        title: "",
        trackNumber: String(nextTrackNumber),
        role: "unknown",
        status: "idea",
        bpm: "",
        keySignature: "",
        mood: "",
        hook: "",
        notes: "",
        audioUrl: "",
        previewAudioUrl: "",
        platformUrl: "",
        visibility: "private",
        playbackStatus: "locked",
        dropDate: "",
        unlockDate: "",
        isFocusTrack: false,
        isSecondFocus: false,
        isPublic: false,
        realmId: "",
        showInNexus: false,
        nexusRole: "public",
        isRealmAnchor: false,
        isPublicPick: false,
        nexusSortOrder: String(nextTrackNumber),
        realmFinderSuggestedRealmId: "",
        realmFinderSecondaryRealmId: "",
        realmFinderTraceRealmId: "",
        realmFinderAlignment: "",
        realmFinderSignals: [],
        realmFinderSummary: "",
        realmFinderDominantSignal: "",
        realmFinderExplanation: "",
        realmFinderScores: null,
        realmFinderVersion: "",
    };
}

function getTrackFormFromReleaseTrack(track: ReleaseTrack): TrackForm {
    return {
        title: track.title ?? "",
        trackNumber: String(track.trackNumber ?? 1),
        role: track.role ?? "unknown",
        status: track.status ?? "idea",
        bpm: track.bpm ? String(track.bpm) : "",
        keySignature: track.keySignature ?? "",
        mood: track.mood ?? "",
        hook: track.hook ?? "",
        notes: track.notes ?? "",
        audioUrl: track.audioUrl ?? "",
        previewAudioUrl: track.previewAudioUrl ?? "",
        platformUrl: track.platformUrl ?? "",
        visibility: track.visibility ?? (track.isPublic ? "public" : "private"),
        playbackStatus: track.playbackStatus ?? "locked",
        dropDate: formatDateForInput(track.dropDate),
        unlockDate: formatDateForInput(track.unlockDate),
        isFocusTrack: Boolean(track.isFocusTrack),
        isSecondFocus: Boolean(track.isSecondFocus),
        isPublic: Boolean(track.isPublic),
        realmId: track.realmId === 0 || track.realmId ? String(track.realmId) : "",
        showInNexus: Boolean(track.showInNexus),
        nexusRole: track.nexusRole ?? "public",
        isRealmAnchor: Boolean(track.isRealmAnchor),
        isPublicPick: Boolean(track.isPublicPick),
        nexusSortOrder: String(track.nexusSortOrder ?? track.trackNumber ?? 999),
        realmFinderSuggestedRealmId:
            track.realmFinderSuggestedRealmId === 0 || track.realmFinderSuggestedRealmId
                ? String(track.realmFinderSuggestedRealmId)
                : "",
        realmFinderSecondaryRealmId:
            track.realmFinderSecondaryRealmId === 0 || track.realmFinderSecondaryRealmId
                ? String(track.realmFinderSecondaryRealmId)
                : "",
        realmFinderTraceRealmId:
            track.realmFinderTraceRealmId === 0 || track.realmFinderTraceRealmId
                ? String(track.realmFinderTraceRealmId)
                : "",
        realmFinderAlignment: track.realmFinderAlignment ? String(track.realmFinderAlignment) : "",
        realmFinderSignals: track.realmFinderSignals ?? [],
        realmFinderSummary: track.realmFinderSummary ?? "",
        realmFinderDominantSignal: track.realmFinderDominantSignal ?? "",
        realmFinderExplanation: track.realmFinderExplanation ?? "",
        realmFinderScores: track.realmFinderScores ?? null,
        realmFinderVersion: track.realmFinderVersion ?? "",
    };
}


function getPublishSignalReadiness(
    form: TrackForm,
    releaseWorld?: ReleaseWorld | null,
) {
    const hasFullAudio = Boolean(form.audioUrl.trim());
    const hasPreviewAudio = Boolean(form.previewAudioUrl.trim());
    const hasOpenDate = Boolean(form.unlockDate || form.dropDate);
    const releaseWorldIsPublic =
        releaseWorld?.visibility === "public" && releaseWorld?.status !== "archived";

    const playbackReady =
        (form.playbackStatus === "playable" && hasFullAudio) ||
        (form.playbackStatus === "preview" && (hasPreviewAudio || hasFullAudio)) ||
        (form.playbackStatus === "coming-soon" && hasOpenDate);

    const checks: PublishSignalCheck[] = [
        {
            key: "release-world",
            label: "Public release world",
            ready: releaseWorldIsPublic,
            detail: releaseWorldIsPublic
                ? "The parent release portal is public and active."
                : "Set the release portal visibility to Public before submitting a signal.",
        },
        {
            key: "realm",
            label: "Realm assigned",
            ready: form.realmId !== "",
            detail:
                form.realmId !== ""
                    ? `Assigned to Realm ${form.realmId}.`
                    : "Choose the realm this signal belongs to.",
        },
        {
            key: "visibility",
            label: "Catalog visibility",
            ready: form.visibility === "public" || form.visibility === "listed",
            detail:
                form.visibility === "public" || form.visibility === "listed"
                    ? `${formatLabel(form.visibility)} visibility is enabled.`
                    : "Choose Public or Listed visibility.",
        },
        {
            key: "playback",
            label: "Playback configured",
            ready: playbackReady,
            detail:
                form.playbackStatus === "playable"
                    ? hasFullAudio
                        ? "Full audio is ready."
                        : "Playable signals require a full Audio URL."
                    : form.playbackStatus === "preview"
                        ? hasPreviewAudio || hasFullAudio
                            ? "Preview playback is ready."
                            : "Preview signals require Preview Audio or full Audio."
                        : form.playbackStatus === "coming-soon"
                            ? hasOpenDate
                                ? "Coming-soon date is ready."
                                : "Coming Soon requires a Drop Date or Unlock Date."
                            : "Choose Playable, Preview, or Coming Soon.",
        },
        {
            key: "status",
            label: "Track is active",
            ready: form.status !== "archived",
            detail:
                form.status !== "archived"
                    ? `${formatLabel(form.status)} tracks can be reviewed.`
                    : "Archived tracks cannot enter the Nexus catalog.",
        },
    ];

    return {
        checks,
        ready: checks.every((check) => check.ready),
        missing: checks.filter((check) => !check.ready).map((check) => check.detail),
    };
}

function getEmptyAssetForm(): AssetForm {
    return {
        title: "",
        usage: "cover",
        kind: "cover",
        url: "",
        fileName: "",
        mimeType: "",
        trackId: "",
        description: "",
        isPublic: true,
    };
}

function getAssetInputFromForm(form: AssetForm, releaseWorldId: string) {
    const usage = form.usage || "other";
    const kind = form.kind || (usage === "track-audio" ? "audio" : "image");

    return {
        releaseWorldId,
        trackId: ["track-audio", "track-artwork"].includes(usage) && form.trackId ? form.trackId : null,
        kind,
        usage,
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        fileName: form.fileName.trim(),
        mimeType: form.mimeType.trim(),
        isPublic: form.isPublic,
    };
}

function getAssetUsageLabel(usage?: string | null) {
    return assetUsageOptions.find((option) => option.value === usage)?.label ?? "Asset";
}

function formatLabel(value?: string | null) {
    if (!value) return "Unknown";

    return value
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getHookTargetOptions(
    releaseWorld?: ReleaseWorld | null,
    releaseTracks: ReleaseTrack[] = [],
): HookTargetOption[] {
    const options: HookTargetOption[] = [
        {
            slug: "project-hook",
            title: "Whole Project",
            meta: "World-level signal",
            kind: "project",
        },
    ];

    releaseTracks.forEach((track) => {
        options.push({
            slug: track.slug,
            title: `Track ${String(track.trackNumber).padStart(2, "0")} — ${track.title}`,
            meta: track.role || "Track",
            kind: "track",
        });
    });

    if (releaseTracks.length === 0) {
        getProjectFocusOptions(releaseWorld).forEach((track) => {
            options.push({
                slug: track.slug,
                title: track.title,
                meta: "Focus signal",
                kind: "track",
            });
        });
    }

    options.push(
        {
            slug: "visual-world",
            title: "Visual World",
            meta: "Artwork / clips / palette",
            kind: "visual",
        },
        {
            slug: "rollout",
            title: "Rollout",
            meta: "Campaign beat",
            kind: "rollout",
        },
        {
            slug: "portal",
            title: "Release Portal",
            meta: "Public page idea",
            kind: "portal",
        },
    );

    return options;
}

function getHookTargetTitle(slug: string, options: HookTargetOption[]) {
    return (
        options.find((option) => option.slug === slug)?.title ?? "Whole Project"
    );
}

function getInitialArtifacts(
    boardColor: ArtifactColor = "cream",
    releaseWorld?: ReleaseWorld | null,
    releaseTitle = "Untitled Release World",
): BoardArtifact[] {
    const title = releaseWorld?.title ?? releaseTitle;
    const summary = getProjectSummary(releaseWorld);
    const focusOptions = getProjectFocusOptions(releaseWorld);

    const starterArtifacts: BoardArtifact[] = [
        {
            id: "release-world-center",
            kind: "center",
            eyebrow: "Release World",
            title,
            body: summary,
            meta: "Main world",
            x: 50,
            y: 42,
            rotate: 0,
            color: boardColor,
            size: "xl",
            layer: 9,
            isGenerated: true,
            isUserCreated: false,
        },
        {
            id: "project-story-lane",
            kind: "note",
            eyebrow: "Story Lane",
            title: "World direction",
            body: "Define the emotional promise, visual language, recurring symbols, and listener journey for this project.",
            meta: "Story",
            x: 28,
            y: 58,
            rotate: -2,
            color: boardColor,
            size: "lg",
            layer: 5,
            isGenerated: true,
            isUserCreated: false,
        },
        {
            id: "visual-language-lane",
            kind: "visual",
            eyebrow: "Visual Language",
            title: "Cover / clips / palette",
            body: "Collect cover ideas, video fragments, photo references, color palettes, typography, and campaign imagery.",
            meta: "Visuals",
            x: 72,
            y: 58,
            rotate: 2,
            color: boardColor,
            size: "lg",
            layer: 5,
            isGenerated: true,
            isUserCreated: false,
        },
        {
            id: "rollout-lane",
            kind: "action",
            eyebrow: "Rollout",
            title: "Release path",
            body: "Map the first teaser, lead signal, second push, final release, and follow-up content.",
            meta: "Campaign",
            x: 38,
            y: 72,
            rotate: 1,
            color: boardColor,
            size: "md",
            layer: 4,
            isGenerated: true,
            isUserCreated: false,
        },
    ];

    focusOptions.forEach((focus, index) => {
        starterArtifacts.push({
            id: `${focus.slug}-card`,
            kind: "track",
            eyebrow: index === 0 ? "Current Focus" : "Second Focus",
            title: focus.title,
            body:
                index === 0
                    ? "Use this as the main entry point for the project. Add hooks, content ideas, cover direction, and release notes around it."
                    : "Use this as the contrast signal or second doorway into the world.",
            meta: index === 0 ? "Lead signal" : "Second signal",
            x: index === 0 ? 30 : 70,
            y: 32,
            rotate: index === 0 ? -1 : 1,
            color: boardColor,
            size: "md",
            layer: 6,
            isGenerated: true,
            isUserCreated: false,
        });
    });

    return starterArtifacts;
}

function mapMongoArtifact(artifact: MongoBoardArtifact): BoardArtifact {
    return {
        id: artifact.id,
        kind: artifact.kind,
        eyebrow: artifact.eyebrow ?? "",
        title: artifact.title,
        body: artifact.body ?? "",
        meta: artifact.meta ?? "",
        href: artifact.href ?? "",
        connectedTrackSlug: artifact.connectedTrackSlug ?? "",
        x: artifact.position.x,
        y: artifact.position.y,
        rotate: artifact.position.rotate,
        color: artifact.style.color ?? "cream",
        size: artifact.style.size ?? "md",
        layer: artifact.style.layer ?? 4,
        isGenerated: artifact.isGenerated,
        isUserCreated: artifact.isUserCreated,
        isPublic: artifact.isPublic,
        pageSection: artifact.pageSection ?? "story",
        pageOrder: artifact.pageOrder ?? 1,
    };
}

function mapArtifactToInput(artifact: BoardArtifact) {
    return {
        id: artifact.id,
        kind: artifact.kind,
        eyebrow: artifact.eyebrow,
        title: artifact.title,
        body: artifact.body,
        meta: artifact.meta ?? "",
        href: artifact.href ?? "",
        connectedTrackSlug: artifact.connectedTrackSlug ?? "",
        x: artifact.x,
        y: artifact.y,
        rotate: artifact.rotate ?? 0,
        color: artifact.color ?? "cream",
        size: artifact.size ?? "md",
        layer: artifact.layer ?? 4,
        isGenerated: artifact.isGenerated ?? false,
        isUserCreated: artifact.isUserCreated ?? true,
        isPublic: artifact.isPublic ?? false,
        pageSection: artifact.pageSection ?? "story",
        pageOrder: artifact.pageOrder ?? 1,
    };
}

function formatDateForInput(value?: string | null) {
    if (!value) return "";

    const cleanValue = String(value).trim();
    const datePrefixMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (datePrefixMatch) {
        const [, year, month, day] = datePrefixMatch;
        return `${year}-${month}-${day}`;
    }

    const numericValue = Number(cleanValue);
    const parsedDate = Number.isFinite(numericValue)
        ? new Date(numericValue)
        : new Date(cleanValue);

    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getPortalSettingsFromReleaseWorld(
    releaseWorld?: ReleaseWorld | null,
): PortalSettings {
    return {
        title: releaseWorld?.title ?? "",
        releaseType: releaseWorld?.releaseType ?? "ep",
        status: releaseWorld?.status ?? "draft",
        visibility: releaseWorld?.visibility ?? "private",
        oneLineSummary: releaseWorld?.oneLineSummary ?? "",
        story: releaseWorld?.story ?? "",
        currentFocus: releaseWorld?.currentFocus ?? "",
        secondFocus: releaseWorld?.secondFocus ?? "",
        fullDropDate: formatDateForInput(releaseWorld?.fullDropDate),
        coverArtUrl: releaseWorld?.coverArtUrl ?? "",
        coverAssetId: releaseWorld?.coverAssetId ?? "",
    };
}

function getPortalSettingsInput(settings: PortalSettings) {
    return {
        title: settings.title.trim(),
        releaseType: settings.releaseType,
        status: settings.status,
        visibility: settings.visibility,
        oneLineSummary: settings.oneLineSummary.trim(),
        story: settings.story.trim(),
        currentFocus: settings.currentFocus.trim(),
        secondFocus: settings.secondFocus.trim(),
        fullDropDate: settings.fullDropDate || null,
        coverArtUrl: settings.coverArtUrl.trim(),
        coverAssetId: settings.coverAssetId.trim() || null,
    };
}

function looksLikeLegacySirensStarter(
    artifacts: BoardArtifact[],
    releaseTitle: string,
) {
    if (releaseTitle.toLowerCase().includes("sirens")) return false;
    if (artifacts.some((artifact) => artifact.isUserCreated)) return false;

    const joinedText = artifacts
        .map(
            (artifact) =>
                `${artifact.title} ${artifact.body} ${artifact.eyebrow} ${artifact.meta}`,
        )
        .join(" ")
        .toLowerCase();

    return (
        joinedText.includes("sirens") ||
        joinedText.includes("neverland") ||
        joinedText.includes("doover") ||
        joinedText.includes("running from the plug") ||
        joinedText.includes("the veil") ||
        joinedText.includes("lit roads")
    );
}

function getStoredBoardState(
    slug: string,
    releaseWorld?: ReleaseWorld | null,
): StoredBoardState {
    const releaseTitle = releaseWorld?.title ?? "Untitled Release World";

    if (typeof window === "undefined") {
        return {
            boardColor: "cream",
            artifacts: getInitialArtifacts("cream", releaseWorld, releaseTitle),
        };
    }

    const stored = window.localStorage.getItem(getStorageKey(slug));

    if (!stored) {
        return {
            boardColor: "cream",
            artifacts: getInitialArtifacts("cream", releaseWorld, releaseTitle),
        };
    }

    try {
        const parsed = JSON.parse(stored) as Partial<StoredBoardState>;

        if (parsed.boardColor && Array.isArray(parsed.artifacts)) {
            if (looksLikeLegacySirensStarter(parsed.artifacts, releaseTitle)) {
                return {
                    boardColor: parsed.boardColor,
                    artifacts: getInitialArtifacts(
                        parsed.boardColor,
                        releaseWorld,
                        releaseTitle,
                    ),
                };
            }

            return {
                boardColor: parsed.boardColor,
                artifacts: parsed.artifacts,
            };
        }
    } catch {
        window.localStorage.removeItem(getStorageKey(slug));
    }

    return {
        boardColor: "cream",
        artifacts: getInitialArtifacts("cream", releaseWorld, releaseTitle),
    };
}

export default function DynamicReleaseSignalBoardPage() {
    const params = useParams<{ slug?: string | string[] }>();
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? (rawSlug[0] ?? "") : (rawSlug ?? "");

    const boardRef = useRef<HTMLElement | null>(null);
    const controlsRef = useRef<HTMLElement | null>(null);

    const [hasHydrated, setHasHydrated] = useState(false);
    const [hasLoadedCloudBoard, setHasLoadedCloudBoard] = useState(false);
    const [saveMessage, setSaveMessage] = useState(
        "Cloud board not saved this session.",
    );

    const [boardColor, setBoardColor] = useState<ArtifactColor>("cream");
    const [artifacts, setArtifacts] = useState<BoardArtifact[]>(() =>
        getInitialArtifacts("cream", null, "Release World"),
    );
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
        null,
    );

    const [selectedTrackSlug, setSelectedTrackSlug] = useState("project-hook");
    const [selectedColor, setSelectedColor] = useState<ArtifactColor>("cream");
    const [selectedSize, setSelectedSize] = useState<ArtifactSize>("md");
    const [selectedLayer, setSelectedLayer] = useState(5);

    const [hookTitle, setHookTitle] = useState("");
    const [hookDescription, setHookDescription] = useState("");
    const [noteTag, setNoteTag] = useState("Creator Note");
    const [noteTitle, setNoteTitle] = useState("");
    const [noteBody, setNoteBody] = useState("");
    const [createMode, setCreateMode] = useState<"hook" | "note">("hook");

    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [isCreatingNewTrack, setIsCreatingNewTrack] = useState(false);
    const [activePanel, setActivePanel] = useState<
        "tracks" | "assets" | "signals" | "portal"
    >("tracks");
    const trackDirty = useRef(false);
    useEffect(() => {
        const openSection = () => {
            const section = window.location.hash.slice(1);
            if (section === "tracks" || section === "assets" || section === "portal" || section === "signals") setActivePanel(section);
        };
        openSection();
        window.addEventListener("hashchange", openSection);
        return () => window.removeEventListener("hashchange", openSection);
    }, []);
    const [trackForm, setTrackForm] = useState<TrackForm>(() =>
        getEmptyTrackForm(1),
    );
    const [trackMessage, setTrackMessage] = useState(
        "Shape the track, capture its hook and notes, and choose its place in the release.",
    );
    const [isUploadingTrackArtwork, setIsUploadingTrackArtwork] = useState(false);
    const [trackArtworkMessage, setTrackArtworkMessage] = useState("");

    const [isRealmFinderOpen, setIsRealmFinderOpen] = useState(false);
    const [realmFinderStep, setRealmFinderStep] = useState(0);
    const [realmFinderAnswers, setRealmFinderAnswers] = useState<Record<string, string>>({});

    const [assetForm, setAssetForm] = useState<AssetForm>(() =>
        getEmptyAssetForm(),
    );
    const [assetMessage, setAssetMessage] = useState(
        "Assets power the portal: cover art updates the hero, track audio connects to songs, and public references support the world.",
    );
    const [selectedAssetFile, setSelectedAssetFile] = useState<File | null>(null);
    const [assetUploadPreviewUrl, setAssetUploadPreviewUrl] = useState("");
    const [isUploadingAsset, setIsUploadingAsset] = useState(false);

    const [portalSettings, setPortalSettings] = useState<PortalSettings>(() =>
        getPortalSettingsFromReleaseWorld(null),
    );
    const [portalMessage, setPortalMessage] = useState(
        "Portal settings control the public Release Page hero, story, cover, and opening date.",
    );

    const {
        data: releaseData,
        loading: releaseLoading,
        error: releaseError,
        refetch: refetchReleaseWorld,
    } = useQuery(GET_RELEASE_WORLD_BY_SLUG, {
        variables: { slug },
        skip: !slug,
        fetchPolicy: "cache-and-network",
    });

    const releaseWorld = releaseData?.getMyReleaseWorldBySlug as
        | ReleaseWorld
        | null
        | undefined;
    const releaseWorldId = releaseWorld?.id;
    const releaseTitle = releaseWorld?.title ?? "Release World";
    const {
        data: boardData,
        loading: boardLoading,
        error: boardError,
        refetch: refetchBoardArtifacts,
    } = useQuery(GET_BOARD_ARTIFACTS, {
        variables: {
            releaseWorldId,
        },
        skip: !releaseWorldId,
        fetchPolicy: "cache-and-network",
    });

    const {
        data: trackData,
        loading: tracksLoading,
        error: tracksError,
        refetch: refetchReleaseTracks,
    } = useQuery(GET_RELEASE_TRACKS, {
        variables: {
            releaseWorldId,
        },
        skip: !releaseWorldId,
        fetchPolicy: "cache-and-network",
    });


    const {
        data: assetData,
        loading: assetsLoading,
        error: assetsError,
        refetch: refetchReleaseAssets,
    } = useQuery(GET_RELEASE_ASSETS, {
        variables: {
            releaseWorldId,
        },
        skip: !releaseWorldId,
        fetchPolicy: "cache-and-network",
    });

    const releaseTracks = useMemo(
        () => (trackData?.getReleaseTracks ?? []) as ReleaseTrack[],
        [trackData],
    );


    const releaseAssets = useMemo(
        () => (assetData?.getReleaseAssets ?? []) as ReleaseAsset[],
        [assetData],
    );

    const hookTargetOptions = useMemo(
        () => getHookTargetOptions(releaseWorld, releaseTracks),
        [releaseWorld, releaseTracks],
    );

    const selectedTrack = useMemo(
        () => releaseTracks.find((track) => track.id === selectedTrackId) ?? null,
        [releaseTracks, selectedTrackId],
    );

    const selectedTrackArtworkAsset = useMemo(() => {
        if (!selectedTrackId) return null;

        return (
            releaseAssets
                .filter(
                    (asset) =>
                        asset.trackId === selectedTrackId &&
                        asset.usage === "track-artwork",
                )
                .slice()
                .sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bTime - aTime;
                })[0] ?? null
        );
    }, [releaseAssets, selectedTrackId]);

    const publishSignalReadiness = useMemo(
        () => getPublishSignalReadiness(trackForm, releaseWorld),
        [trackForm, releaseWorld],
    );

    const nexusReviewStatus = selectedTrack?.nexusReviewStatus || "draft";
    const publishSignalState = trackForm.showInNexus
        ? "Published"
        : nexusReviewStatus === "in-review"
            ? "In review"
            : nexusReviewStatus === "needs-changes"
                ? "Needs changes"
                : nexusReviewStatus === "approved"
                    ? "Approved"
                    : publishSignalReadiness.ready
                        ? "Ready for review"
                        : "Draft";

    const realmFinderQuestion = realmFinderQuestions[realmFinderStep] ?? realmFinderQuestions[0];
    const realmFinderIsComplete = realmFinderQuestions.every(
        (question) => Boolean(realmFinderAnswers[question.id]),
    );
    const realmFinderResult = getRealmFinderResult(realmFinderAnswers);

    const [saveBoardArtifacts, { loading: isSaving }] =
        useMutation(SAVE_BOARD_ARTIFACTS);
    const [updateReleaseWorld, { loading: isUpdatingPortal }] =
        useMutation(UPDATE_RELEASE_WORLD);
    const [createReleaseTrack, { loading: isCreatingTrack }] =
        useMutation(CREATE_RELEASE_TRACK);
    const [updateReleaseTrack, { loading: isUpdatingTrack }] =
        useMutation(UPDATE_RELEASE_TRACK);
    const [submitTrackForNexusReview, { loading: isSubmittingNexusReview }] =
        useMutation(SUBMIT_TRACK_FOR_NEXUS_REVIEW);
    const [deleteReleaseTrack, { loading: isDeletingTrack }] =
        useMutation(DELETE_RELEASE_TRACK);
    const [createReleaseAsset, { loading: isCreatingAsset }] =
        useMutation(CREATE_RELEASE_ASSET);
    const [deleteReleaseAsset, { loading: isDeletingAsset }] =
        useMutation(DELETE_RELEASE_ASSET);

    const coverAssets = useMemo(
        () => releaseAssets.filter((asset) => asset.usage === "cover" || asset.kind === "cover"),
        [releaseAssets],
    );

    const trackAudioAssets = useMemo(
        () => releaseAssets.filter((asset) => asset.usage === "track-audio" || asset.kind === "audio"),
        [releaseAssets],
    );

    const publishedArtifacts = useMemo(
        () => artifacts.filter((artifact) => artifact.isPublic),
        [artifacts],
    );

    const visibleReleaseTracks = useMemo(
        () =>
            releaseTracks.filter(
                (track) =>
                    track.visibility === "listed" ||
                    track.visibility === "public" ||
                    track.isPublic,
            ),
        [releaseTracks],
    );

    const playableReleaseTracks = useMemo(
        () =>
            visibleReleaseTracks.filter(
                (track) =>
                    track.playbackStatus === "playable" &&
                    Boolean(track.audioUrl?.trim()),
            ),
        [visibleReleaseTracks],
    );

    const previewReleaseTracks = useMemo(
        () =>
            visibleReleaseTracks.filter(
                (track) =>
                    track.playbackStatus === "preview" &&
                    Boolean(track.previewAudioUrl?.trim()),
            ),
        [visibleReleaseTracks],
    );

    const releasePageOutputStats = [
        { label: "Portal", value: releaseWorld?.visibility === "public" ? "Public" : formatLabel(releaseWorld?.visibility) },
        { label: "Cover", value: releaseWorld?.coverArtUrl ? "Added" : "Needed" },
        { label: "Story", value: releaseWorld?.story?.trim() || releaseWorld?.oneLineSummary?.trim() ? "Added" : "Needed" },
        { label: "Tracks", value: `${visibleReleaseTracks.length}/${releaseTracks.length} visible` },
        { label: "Playable", value: `${playableReleaseTracks.length} play • ${previewReleaseTracks.length} preview` },
        { label: "Fragments", value: `${publishedArtifacts.length} published` },
    ];

    useEffect(() => {
        if (!selectedAssetFile || !selectedAssetFile.type.startsWith("image/")) {
            setAssetUploadPreviewUrl("");
            return;
        }

        const previewUrl = URL.createObjectURL(selectedAssetFile);
        setAssetUploadPreviewUrl(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [selectedAssetFile]);

    useEffect(() => {
        if (
            !hookTargetOptions.some((target) => target.slug === selectedTrackSlug)
        ) {
            setSelectedTrackSlug(hookTargetOptions[0]?.slug ?? "project-hook");
        }
    }, [hookTargetOptions, selectedTrackSlug]);

    useEffect(() => {
        if (!releaseWorldId) return;

        if (isCreatingNewTrack) return;

        if (!selectedTrackId && releaseTracks.length > 0) {
            const firstTrack = releaseTracks[0];
            setSelectedTrackId(firstTrack.id);
            setTrackForm(getTrackFormFromReleaseTrack(firstTrack));
            setTrackMessage(
                `Loaded ${releaseTracks.length} track${releaseTracks.length === 1 ? "" : "s"} from MongoDB.`,
            );
            return;
        }

        if (selectedTrack && !trackDirty.current) {
            setTrackForm(getTrackFormFromReleaseTrack(selectedTrack));
            return;
        }

        if (releaseTracks.length === 0) {
            setTrackForm(getEmptyTrackForm(1));
            setTrackMessage(
                "No tracks yet. Add the first song for this release world.",
            );
        }
    }, [
        releaseWorldId,
        releaseTracks,
        selectedTrack,
        selectedTrackId,
        isCreatingNewTrack,
    ]);

    useEffect(() => {
        if (!releaseWorld) return;

        setPortalSettings(getPortalSettingsFromReleaseWorld(releaseWorld));
        setPortalMessage("Portal settings loaded. These fields feed the public Release Page hero and story.");
    }, [releaseWorld]);

    useEffect(() => {
        if (!slug || !releaseWorld) return;

        const storedState = getStoredBoardState(slug, releaseWorld);
        setBoardColor(storedState.boardColor);
        setArtifacts(storedState.artifacts);
        setSelectedColor(storedState.boardColor);
        setHasHydrated(true);
    }, [slug, releaseWorld]);

    useEffect(() => {
        const cloudArtifacts = boardData?.getBoardArtifacts as
            | MongoBoardArtifact[]
            | undefined;

        if (!cloudArtifacts || hasLoadedCloudBoard || !releaseWorld) return;

        if (cloudArtifacts.length === 0) {
            const starterArtifacts = getInitialArtifacts(
                boardColor,
                releaseWorld,
                releaseTitle,
            );

            setArtifacts(starterArtifacts);
            setSelectedArtifactId(starterArtifacts[0]?.id ?? null);
            setHasLoadedCloudBoard(true);
            setSaveMessage(
                "No cloud artifacts yet. Generic starter board created locally. Save to Cloud when ready.",
            );
            return;
        }

        const mappedArtifacts = cloudArtifacts.map(mapMongoArtifact);

        if (looksLikeLegacySirensStarter(mappedArtifacts, releaseTitle)) {
            const starterArtifacts = getInitialArtifacts(
                boardColor,
                releaseWorld,
                releaseTitle,
            );

            setArtifacts(starterArtifacts);
            setSelectedArtifactId(starterArtifacts[0]?.id ?? null);
            setHasLoadedCloudBoard(true);
            setSaveMessage(
                "Legacy SIRENS starter detected for this project. Generic starter board created locally. Save to Cloud to replace it.",
            );
            return;
        }

        const firstColor = mappedArtifacts[0]?.color ?? "cream";

        setArtifacts(mappedArtifacts);
        setBoardColor(firstColor);
        setSelectedColor(firstColor);
        setSelectedArtifactId(mappedArtifacts[0]?.id ?? null);
        setHasLoadedCloudBoard(true);
        setSaveMessage(`Loaded ${mappedArtifacts.length} artifacts from MongoDB.`);
    }, [boardData, hasLoadedCloudBoard, boardColor, releaseWorld, releaseTitle]);

    useEffect(() => {
        if (!hasHydrated || !slug) return;

        window.localStorage.setItem(
            getStorageKey(slug),
            JSON.stringify({
                boardColor,
                artifacts,
            }),
        );
    }, [hasHydrated, slug, boardColor, artifacts]);

    useEffect(() => {
        if (!activeId) return;

        function handlePointerMove(event: globalThis.PointerEvent) {
            const board = boardRef.current;
            if (!board) return;

            const rect = board.getBoundingClientRect();
            const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
            const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 6, 94);

            setArtifacts((current) =>
                current.map((artifact) =>
                    artifact.id === activeId ? { ...artifact, x, y } : artifact,
                ),
            );
            setSaveMessage("Unsaved changes. Save to Cloud when ready.");
        }

        function handlePointerUp() {
            setActiveId(null);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [activeId]);

    const selectedArtifact = useMemo(
        () =>
            artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null,
        [artifacts, selectedArtifactId],
    );

    const hookArtifacts = useMemo(
        () => artifacts.filter((artifact) => artifact.kind === "hook"),
        [artifacts],
    );

    const hookCounts = useMemo(
        () =>
            hookTargetOptions.map((target) => ({
                slug: target.slug,
                title: target.title,
                meta: target.meta,
                count: hookArtifacts.filter(
                    (artifact) => artifact.connectedTrackSlug === target.slug,
                ).length,
            })),
        [hookTargetOptions, hookArtifacts],
    );

    function getNextTrackNumber() {
        const highestTrackNumber = releaseTracks.reduce(
            (highest, track) => Math.max(highest, track.trackNumber ?? 0),
            0,
        );

        return highestTrackNumber + 1;
    }

    function handleRealmFinderAnswer(questionId: string, optionId: string) {
        setRealmFinderAnswers((current) => ({
            ...current,
            [questionId]: optionId,
        }));

        if (realmFinderStep < realmFinderQuestions.length - 1) {
            setRealmFinderStep((current) => current + 1);
        }
    }

    function handleRealmFinderReset() {
        setRealmFinderAnswers({});
        setRealmFinderStep(0);
    }

    function handleUseRealmFinderResult() {
        const realmId = String(realmFinderResult.realmId);

        setTrackForm((current) => ({
            ...current,
            realmId,
            realmFinderSuggestedRealmId: realmId,
            realmFinderSecondaryRealmId: String(realmFinderResult.runnerUp.realmId),
            realmFinderTraceRealmId: String(realmFinderResult.trace.realmId),
            realmFinderAlignment: "",
            realmFinderSignals: realmFinderResult.meta.signals,
            realmFinderSummary: realmFinderResult.meta.summary,
            realmFinderDominantSignal: realmFinderResult.dominantSignal,
            realmFinderExplanation: realmFinderResult.explanation,
            realmFinderScores: {
                realm303: realmFinderResult.resonanceScores[303],
                realm202: realmFinderResult.resonanceScores[202],
                realm101: realmFinderResult.resonanceScores[101],
                realm55: realmFinderResult.resonanceScores[55],
                realm44: realmFinderResult.resonanceScores[44],
                realm0: realmFinderResult.resonanceScores[0],
            },
            realmFinderVersion: "v3",
        }));

        setTrackMessage(
            `Realm Profile suggests ${realmFinderResult.realmId} — ${realmFinderResult.meta.name} as Home, ${realmFinderResult.runnerUp.realmId} — ${realmFinderResult.runnerUpMeta.name} as Secondary, and ${realmFinderResult.trace.realmId} — ${realmFinderResult.traceMeta.name} as Trace. Save the track when you are ready.`,
        );
        setIsRealmFinderOpen(false);
    }

    function updateTrackForm<K extends keyof TrackForm>(
        key: K,
        value: TrackForm[K],
    ) {
        trackDirty.current = true;
        setTrackForm((current) => ({
            ...current,
            [key]: value,
        }));
        setTrackMessage(
            "Unsaved track changes. Save Track to update the song layer.",
        );
    }

    function handleSelectTrack(track: ReleaseTrack) {
        trackDirty.current = false;
        setIsCreatingNewTrack(false);
        setSelectedTrackId(track.id);
        setTrackForm(getTrackFormFromReleaseTrack(track));
        setTrackMessage(
            `Editing Track ${String(track.trackNumber).padStart(2, "0")} — ${track.title}.`,
        );
    }

    function handleNewTrack() {
        trackDirty.current = false;
        setIsCreatingNewTrack(true);
        setSelectedTrackId(null);
        setTrackForm(getEmptyTrackForm(getNextTrackNumber()));
        setTrackMessage("Creating a new track for this release world.");
    }

    async function saveTrackForm(
        formToSave: TrackForm,
        successMessage?: string,
    ) {
        if (!releaseWorldId) {
            setTrackMessage("Track save failed: release world could not be found.");
            return;
        }

        if (!formToSave.title.trim()) {
            setTrackMessage("Track save failed: title is required.");
            return;
        }

        try {
            const isUpdatingExistingTrack = Boolean(
                selectedTrackId && !isCreatingNewTrack,
            );
            setTrackMessage(
                isUpdatingExistingTrack
                    ? "Updating track in MongoDB..."
                    : "Creating track in MongoDB...",
            );

            const input = isUpdatingExistingTrack && selectedTrack
                ? getTrackUpdateFromForms(formToSave, getTrackFormFromReleaseTrack(selectedTrack))
                : getTrackInputFromForm(formToSave);
            const result = isUpdatingExistingTrack
                ? await updateReleaseTrack({
                    variables: {
                        id: selectedTrackId,
                        input,
                    },
                })
                : await createReleaseTrack({
                    variables: {
                        input: {
                            releaseWorldId,
                            ...input,
                        },
                    },
                });

            const savedTrack = (
                isUpdatingExistingTrack
                    ? result.data?.updateReleaseTrack
                    : result.data?.createReleaseTrack
            ) as ReleaseTrack | undefined;

            await refetchReleaseTracks();
            await refetchReleaseWorld();

            if (savedTrack) {
                trackDirty.current = false;
                setIsCreatingNewTrack(false);
                setSelectedTrackId(savedTrack.id);
                setTrackForm(getTrackFormFromReleaseTrack(savedTrack));
                setTrackMessage(
                    successMessage ||
                        `Saved: ${savedTrack.title} · ${savedTrack.visibility} · ${savedTrack.playbackStatus}.`,
                );
            } else {
                setTrackMessage("Track saved, but no track was returned.");
            }
        } catch (trackError) {
            const message =
                trackError instanceof Error
                    ? trackError.message
                    : "Unknown track save error.";
            setTrackMessage(`Track save failed: ${message}`);
        }
    }

    async function handleSaveTrack() {
        await saveTrackForm(trackForm);
    }

    async function handleTrackArtworkFile(file: File | null) {
        if (!file) return;

        if (!releaseWorldId) {
            setTrackArtworkMessage("Release world could not be found.");
            return;
        }

        if (!selectedTrackId || isCreatingNewTrack) {
            setTrackArtworkMessage("Save this track first, then drop in artwork.");
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
            setTrackArtworkMessage("Choose a JPG, PNG, WebP, or GIF image.");
            return;
        }

        try {
            setIsUploadingTrackArtwork(true);
            setTrackArtworkMessage("Uploading artwork...");

            const safeFileName =
                file.name
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]+/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-+|-+$/g, "") || "track-artwork";

            const releaseSegment =
                releaseWorldId
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]+/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-+|-+$/g, "") || "release-world";

            const pathname = `release-images/${releaseSegment}/${Date.now()}-${safeFileName}`;

            const uploadResult = await upload(pathname, file, {
                access: "public",
                handleUploadUrl: "/api/upload",
                clientPayload: JSON.stringify({
                    releaseWorldId,
                    kind: "image",
                    usage: "track-artwork",
                    trackId: selectedTrackId,
                }),
            });

            const result = await createReleaseAsset({
                variables: {
                    input: {
                        ...getAssetInputFromForm(
                            {
                                title: `${selectedTrack?.title || trackForm.title || "Track"} artwork`,
                                usage: "track-artwork",
                                kind: "image",
                                url: uploadResult.url,
                                fileName: file.name,
                                mimeType: file.type,
                                trackId: selectedTrackId,
                                description: "",
                                isPublic: Boolean(selectedTrack?.isPublic),
                            },
                            releaseWorldId,
                        ),
                        size: file.size,
                    },
                },
            });

            const savedAsset = result.data?.createReleaseAsset as ReleaseAsset | undefined;

            await refetchReleaseAssets();
            await refetchReleaseWorld();
            await refetchReleaseTracks();

            setTrackArtworkMessage(
                savedAsset
                    ? "Artwork attached."
                    : "Artwork saved, but no asset was returned.",
            );
        } catch (uploadError) {
            const message =
                uploadError instanceof Error
                    ? uploadError.message
                    : "Unknown artwork upload error.";
            setTrackArtworkMessage(`Artwork upload failed: ${message}`);
        } finally {
            setIsUploadingTrackArtwork(false);
        }
    }

    function handleTrackArtworkDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        void handleTrackArtworkFile(event.dataTransfer.files?.[0] ?? null);
    }

    async function handleSubmitForNexusReview() {
        if (!selectedTrackId || isCreatingNewTrack) {
            setTrackMessage("Save this track before submitting it for Nexus review.");
            return;
        }

        if (!publishSignalReadiness.ready) {
            setTrackMessage(`Signal is not ready for review: ${publishSignalReadiness.missing.join(" ")}`);
            return;
        }

        try {
            // Persist the current Signal Board form first so Realm Finder intelligence,
            // Realm choice, and any other unsaved edits are part of the submitted snapshot.
            await updateReleaseTrack({
                variables: {
                    id: selectedTrackId,
                    input: selectedTrack ? getTrackUpdateFromForms(trackForm, getTrackFormFromReleaseTrack(selectedTrack)) : getTrackInputFromForm(trackForm),
                },
            });

            const result = await submitTrackForNexusReview({
                variables: { trackId: selectedTrackId },
            });
            const submitted = result.data?.submitTrackForNexusReview as ReleaseTrack | undefined;
            await refetchReleaseTracks();
            if (submitted) {
                setTrackForm(getTrackFormFromReleaseTrack(submitted));
            }
            setTrackMessage("Submitted for Nexus review. Cosmic staff can now review the signal and Realm placement.");
        } catch (reviewError) {
            const message = reviewError instanceof Error ? reviewError.message : "Unknown Nexus review error.";
            setTrackMessage(`Nexus submission failed: ${message}`);
        }
    }

    async function handleDeleteTrack() {
        if (!selectedTrackId) {
            setTrackMessage("Select a track before deleting.");
            return;
        }

        const trackTitle = selectedTrack?.title ?? "Selected track";
        const confirmed = window.confirm(
            `Delete ${trackTitle}? This removes the track from this release world.`,
        );

        if (!confirmed) {
            setTrackMessage("Delete cancelled.");
            return;
        }

        try {
            setTrackMessage(`Deleting ${trackTitle}...`);

            await deleteReleaseTrack({
                variables: {
                    id: selectedTrackId,
                },
            });

            setSelectedTrackId(null);
            setIsCreatingNewTrack(true);
            setTrackForm(getEmptyTrackForm(Math.max(getNextTrackNumber() - 1, 1)));
            await refetchReleaseTracks();
            await refetchReleaseWorld();
            setTrackMessage(`${trackTitle} deleted from this release world.`);
        } catch (trackError) {
            const message =
                trackError instanceof Error
                    ? trackError.message
                    : "Unknown track delete error.";
            setTrackMessage(`Track delete failed: ${message}`);
        }
    }


    function getUploadKindFromAssetForm() {
        if (assetForm.usage === "track-audio") return "audio";
        if (assetForm.usage === "track-artwork") return "image";
        if (assetForm.usage === "cover") return "cover";
        return assetForm.kind || "asset";
    }

    function handleAssetFileChange(fileList: FileList | null) {
        const file = fileList?.[0] ?? null;
        setSelectedAssetFile(file);

        if (!file) {
            setAssetMessage("No file selected yet.");
            return;
        }

        setAssetForm((current) => ({
            ...current,
            title: current.title || file.name.replace(/\.[^/.]+$/, ""),
            fileName: file.name,
            mimeType: file.type || current.mimeType,
        }));

        setAssetMessage(`Selected ${file.name}. Upload it to Blob when ready.`);
    }

    function updateAssetForm<K extends keyof AssetForm>(
        key: K,
        value: AssetForm[K],
    ) {
        setAssetForm((current) => {
            const next = {
                ...current,
                [key]: value,
            };

            if (key === "usage") {
                const usage = String(value);
                if (usage === "cover") next.kind = "cover";
                if (usage === "track-audio") next.kind = "audio";
                if (usage === "track-artwork") next.kind = "image";
                if (usage === "visual-reference") next.kind = "image";
            }

            return next;
        });
        setAssetMessage("Unsaved asset changes. Register asset to sync it to the release world.");
    }

    async function handleUploadAndCreateAsset() {
        if (!releaseWorldId) {
            setAssetMessage("Upload failed: release world could not be found.");
            return;
        }

        if (!selectedAssetFile) {
            setAssetMessage("Upload failed: choose a file first.");
            return;
        }

        if (["track-audio", "track-artwork"].includes(assetForm.usage) && !assetForm.trackId) {
            setAssetMessage("Upload failed: choose a track before attaching this asset.");
            return;
        }

        if (assetForm.usage === "cover" && !selectedAssetFile.type.startsWith("image/")) {
            setAssetMessage("Upload failed: cover art must be an image file.");
            return;
        }

        if (assetForm.usage === "track-audio" && !selectedAssetFile.type.startsWith("audio/")) {
            setAssetMessage("Upload failed: track audio must be an audio file.");
            return;
        }

        if (assetForm.usage === "track-artwork" && !selectedAssetFile.type.startsWith("image/")) {
            setAssetMessage("Upload failed: track artwork must be an image file.");
            return;
        }

        try {
            setIsUploadingAsset(true);
            setAssetMessage("Uploading file directly to Vercel Blob...");

            const uploadKind = getUploadKindFromAssetForm();
            const safeFileName =
                selectedAssetFile.name
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]+/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-+|-+$/g, "") || "upload";
            const releaseSegment =
                releaseWorldId
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]+/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-+|-+$/g, "") || "release-world";

            const folder =
                uploadKind === "audio"
                    ? "release-audio"
                    : uploadKind === "cover"
                        ? "release-covers"
                        : uploadKind === "image"
                            ? "release-images"
                            : uploadKind === "video"
                                ? "release-videos"
                                : uploadKind === "document"
                                    ? "release-documents"
                                    : "release-assets";

            const pathname = `${folder}/${releaseSegment}/${Date.now()}-${safeFileName}`;

            const uploadResult = await upload(pathname, selectedAssetFile, {
                access: "public",
                handleUploadUrl: "/api/upload",
                clientPayload: JSON.stringify({
                    releaseWorldId,
                    kind: uploadKind,
                    usage: assetForm.usage,
                    trackId: assetForm.trackId,
                }),
            });

            setAssetMessage("Blob upload complete. Registering asset in MongoDB...");

            const input = {
                ...getAssetInputFromForm(
                    {
                        ...assetForm,
                        title:
                            assetForm.title.trim() ||
                            selectedAssetFile.name ||
                            "Uploaded asset",
                        url: uploadResult.url,
                        fileName: selectedAssetFile.name,
                        mimeType: selectedAssetFile.type,
                    },
                    releaseWorldId,
                ),
                size: selectedAssetFile.size,
            };

            const result = await createReleaseAsset({
                variables: {
                    input,
                },
            });

            const savedAsset = result.data?.createReleaseAsset as ReleaseAsset | undefined;

            await refetchReleaseAssets();
            await refetchReleaseWorld();
            await refetchReleaseTracks();

            if (savedAsset) {
                setAssetMessage(
                    `Uploaded and saved: ${savedAsset.title}. ${getAssetUsageLabel(
                        savedAsset.usage,
                    )} is now synced to this release world.`,
                );
                setSelectedAssetFile(null);
                setAssetForm((current) => ({
                    ...getEmptyAssetForm(),
                    usage: current.usage,
                    kind:
                        current.usage === "track-audio"
                            ? "audio"
                            : current.usage === "cover"
                                ? "cover"
                                : "image",
                    trackId: ["track-audio", "track-artwork"].includes(current.usage) ? current.trackId : "",
                }));
            } else {
                setAssetMessage("Uploaded and saved, but no asset was returned.");
            }
        } catch (uploadError) {
            const message =
                uploadError instanceof Error
                    ? uploadError.message
                    : "Unknown upload error.";
            setAssetMessage(`Upload failed: ${message}`);
        } finally {
            setIsUploadingAsset(false);
        }
    }

    async function handleCreateAsset() {
        if (!releaseWorldId) {
            setAssetMessage("Asset save failed: release world could not be found.");
            return;
        }

        if (!assetForm.title.trim()) {
            setAssetMessage("Asset save failed: title is required.");
            return;
        }

        if (!assetForm.url.trim()) {
            setAssetMessage("Asset save failed: URL is required.");
            return;
        }

        if (["track-audio", "track-artwork"].includes(assetForm.usage) && !assetForm.trackId) {
            setAssetMessage("Asset save failed: choose a track before attaching audio.");
            return;
        }

        try {
            setAssetMessage("Registering asset in MongoDB...");

            const result = await createReleaseAsset({
                variables: {
                    input: getAssetInputFromForm(assetForm, releaseWorldId),
                },
            });

            const savedAsset = result.data?.createReleaseAsset as ReleaseAsset | undefined;

            await refetchReleaseAssets();
            await refetchReleaseWorld();
            await refetchReleaseTracks();

            if (savedAsset) {
                setAssetMessage(
                    `Asset saved: ${savedAsset.title}. ${getAssetUsageLabel(
                        savedAsset.usage,
                    )} is now synced to the Creator OS.`,
                );
                setAssetForm((current) => ({
                    ...getEmptyAssetForm(),
                    usage: current.usage,
                    kind: current.usage === "track-audio" ? "audio" : current.usage === "cover" ? "cover" : "image",
                    trackId: ["track-audio", "track-artwork"].includes(current.usage) ? current.trackId : "",
                }));
            } else {
                setAssetMessage("Asset saved, but no asset was returned.");
            }
        } catch (assetError) {
            const message =
                assetError instanceof Error
                    ? assetError.message
                    : "Unknown asset save error.";
            setAssetMessage(`Asset save failed: ${message}`);
        }
    }

    async function handleDeleteAsset(asset: ReleaseAsset) {
        if (!asset?.id) {
            setAssetMessage("Delete failed: asset could not be found.");
            return;
        }

        const isCoverAsset = asset.usage === "cover" || asset.kind === "cover";
        const isTrackAudioAsset =
            asset.usage === "track-audio" || asset.kind === "audio";
        const attachedTrack = releaseTracks.find((track) => track.id === asset.trackId);
        const impactNote = isCoverAsset
            ? " This will also clear the active release cover if this asset is currently connected."
            : isTrackAudioAsset
                ? ` This will also clear the attached audio URL${attachedTrack ? ` for ${attachedTrack.title}` : ""} if it is currently connected.`
                : "";

        const confirmed = window.confirm(
            `Delete asset "${asset.title}"?${impactNote} The backend will also attempt Vercel Blob cleanup.`,
        );

        if (!confirmed) {
            setAssetMessage("Asset delete cancelled.");
            return;
        }

        try {
            setAssetMessage(`Deleting asset: ${asset.title}...`);

            const result = await deleteReleaseAsset({
                variables: {
                    id: asset.id,
                },
            });

            const deletedAsset = result.data?.deleteReleaseAsset as
                | ReleaseAsset
                | undefined;

            await refetchReleaseAssets();
            await refetchReleaseWorld();
            await refetchReleaseTracks();

            setAssetMessage(
                deletedAsset
                    ? `Deleted ${deletedAsset.title}. Connected cover/audio fields were cleared and Blob cleanup was requested.`
                    : "Asset deleted. Connected cover/audio fields were cleared and Blob cleanup was requested.",
            );
        } catch (assetError) {
            const message =
                assetError instanceof Error
                    ? assetError.message
                    : "Unknown asset delete error.";
            setAssetMessage(`Asset delete failed: ${message}`);
        }
    }

    function updatePortalSetting<K extends keyof PortalSettings>(
        key: K,
        value: PortalSettings[K],
    ) {
        setPortalSettings((current) => ({
            ...current,
            [key]: value,
        }));
        setPortalMessage(
            "Unsaved portal changes. Save Portal Settings to update the release page.",
        );
    }

    function updateArtifact(id: string, updates: Partial<BoardArtifact>) {
        setArtifacts((current) =>
            current.map((artifact) =>
                artifact.id === id ? { ...artifact, ...updates } : artifact,
            ),
        );
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function handleArtifactPointerDown(
        event: PointerEvent<HTMLElement>,
        id: string,
    ) {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setSelectedArtifactId(id);
        setActiveId(id);
    }

    function nudgeLayer(id: string, direction: -1 | 1) {
        setArtifacts((current) =>
            current.map((artifact) =>
                artifact.id === id
                    ? {
                        ...artifact,
                        layer: clamp((artifact.layer ?? 4) + direction, 1, 9),
                    }
                    : artifact,
            ),
        );
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function addHook() {
        const cleanTitle = hookTitle.trim();
        const cleanDescription = hookDescription.trim();
        if (!cleanTitle && !cleanDescription) return;

        const trackTitle = getHookTargetTitle(selectedTrackSlug, hookTargetOptions);
        const matchingTrackIndex = hookTargetOptions.findIndex(
            (target) => target.slug === selectedTrackSlug,
        );
        const id = makeId("hook");

        setArtifacts((current) => [
            ...current,
            {
                id,
                kind: "hook",
                eyebrow: `${trackTitle} Hook`,
                title: cleanTitle || cleanDescription.slice(0, 34),
                body: cleanDescription || cleanTitle,
                meta: "Hook artifact",
                connectedTrackSlug: selectedTrackSlug,
                x: clamp(24 + Math.max(matchingTrackIndex, 0) * 18, 12, 88),
                y: clamp(82 - Math.max(matchingTrackIndex, 0) * 5, 16, 92),
                rotate: matchingTrackIndex % 2 === 0 ? -2 : 2,
                color: selectedColor,
                size: selectedSize,
                layer: selectedLayer,
                isGenerated: false,
                isUserCreated: true,
            },
        ]);

        setSelectedArtifactId(id);
        setHookTitle("");
        setHookDescription("");
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function addNoteArtifact() {
        const cleanBody = noteBody.trim();
        if (!cleanBody) return;

        const id = makeId("note");

        setArtifacts((current) => [
            ...current,
            {
                id,
                kind: "note",
                eyebrow: noteTag.trim() || "Creator Note",
                title: noteTitle.trim() || "New artifact",
                body: cleanBody,
                meta: "Artifact",
                x: 64,
                y: 72,
                rotate: -1,
                color: selectedColor,
                size: selectedSize,
                layer: selectedLayer,
                isGenerated: false,
                isUserCreated: true,
            },
        ]);

        setSelectedArtifactId(id);
        setNoteTitle("");
        setNoteBody("");
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function applyStarterBoardColor(nextColor: ArtifactColor) {
        setBoardColor(nextColor);
        setSelectedColor(nextColor);
        setArtifacts((current) =>
            current.map((artifact) =>
                artifact.isUserCreated
                    ? artifact
                    : {
                        ...artifact,
                        color: nextColor,
                    },
            ),
        );
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function deleteArtifact(id: string) {
        setArtifacts((current) => current.filter((artifact) => artifact.id !== id));
        if (selectedArtifactId === id) setSelectedArtifactId(null);
        setSaveMessage("Unsaved changes. Save to Cloud when ready.");
    }

    function resetBoard() {
        const resetArtifacts = getInitialArtifacts(
            boardColor,
            releaseWorld,
            releaseTitle,
        );
        setArtifacts(resetArtifacts);
        setSelectedArtifactId(null);
        setSaveMessage(
            "Local board reset. Save to Cloud only if you want to replace the cloud board.",
        );
    }

    async function handleSavePortalSettings() {
        if (!releaseWorldId) {
            setPortalMessage("Save failed: release world could not be found.");
            return;
        }

        if (!portalSettings.title.trim()) {
            setPortalMessage("Save failed: title is required.");
            return;
        }

        try {
            setPortalMessage("Saving portal settings to MongoDB...");

            const result = await updateReleaseWorld({
                variables: {
                    id: releaseWorldId,
                    input: getPortalSettingsInput(portalSettings),
                },
            });

            const updatedWorld = result.data?.updateReleaseWorld as
                | ReleaseWorld
                | undefined;

            if (updatedWorld) {
                setPortalSettings(getPortalSettingsFromReleaseWorld(updatedWorld));
                setPortalMessage(
                    "Portal settings saved. Open the Release Page to see the polished portal update.",
                );
                await refetchReleaseWorld();
            } else {
                setPortalMessage(
                    "Portal settings saved, but no release world was returned.",
                );
            }
        } catch (portalError) {
            const message =
                portalError instanceof Error
                    ? portalError.message
                    : "Unknown portal save error.";
            setPortalMessage(`Portal save failed: ${message}`);
        }
    }

    async function handleSaveToCloud() {
        if (!releaseWorldId) {
            setSaveMessage("Save failed: release world could not be found.");
            return;
        }

        try {
            setSaveMessage("Saving board to MongoDB...");

            const result = await saveBoardArtifacts({
                variables: {
                    releaseWorldId,
                    artifacts: artifacts.map(mapArtifactToInput),
                },
            });

            const savedArtifacts = result.data?.saveBoardArtifacts as
                | MongoBoardArtifact[]
                | undefined;

            if (savedArtifacts) {
                const mappedArtifacts = savedArtifacts.map(mapMongoArtifact);
                setArtifacts(mappedArtifacts);
                setSelectedArtifactId(mappedArtifacts[0]?.id ?? null);
                setHasLoadedCloudBoard(true);
                setSaveMessage(`Saved ${mappedArtifacts.length} artifacts to MongoDB.`);
            } else {
                setSaveMessage("Board saved, but no artifacts were returned.");
            }
        } catch (saveError) {
            const message =
                saveError instanceof Error ? saveError.message : "Unknown save error.";
            setSaveMessage(`Save failed: ${message}`);
        }
    }

    async function handleReloadCloudBoard() {
        setHasLoadedCloudBoard(false);
        setSaveMessage("Reloading cloud board...");
        await refetchReleaseWorld();

        if (releaseWorldId) {
            await refetchBoardArtifacts();
        }
    }

    const cloudStatus = releaseLoading
        ? "Finding release world..."
        : releaseError
            ? "Release lookup error"
            : boardLoading
                ? "Loading cloud board..."
                : boardError
                    ? "Cloud load error"
                    : hasLoadedCloudBoard
                        ? "Cloud board loaded"
                        : releaseWorld
                            ? "Project board ready"
                            : "Release world not found";

    function handleManageTrackAudio() {
        if (!selectedTrackId || isCreatingNewTrack) return;
        setAssetForm((current) => ({ ...current, usage: "track-audio", kind: "audio", trackId: selectedTrackId }));
        setSelectedAssetFile(null);
        setAssetUploadPreviewUrl("");
        setActivePanel("assets");
    }

    const cloudMessage =
        releaseError?.message || boardError?.message || saveMessage;

    return (
        <main className="signal-board-shell signal-board-shell-compact">
            <header
                className="signal-board-command-bar"
                aria-label="Workshop command bar"
            >
                <div className="signal-board-command-left">
                    <Link href="/creator/projects">All Projects</Link>
                    <Link href={`/releases/${slug}`}>Preview Release</Link>
                </div>

                <div className="signal-board-command-title">
                    <p className="signal-board-panel-kicker">Creator Workshop</p>
                    <h1>
                        {releaseWorld?.title
                            ? `${releaseWorld.title} Workshop`
                            : "Release Workshop"}
                    </h1>
                    <span>
                        {releaseTracks.length} tracks • {releaseAssets.length} assets · Develop here, then Prepare Release.
                    </span>
                </div>

                <div className="signal-board-command-actions">
                    <Link data-workspace-tour="prepare" className="signal-board-prepare-release" href={`/creator/releases/${slug}/publish`}>Prepare Release →</Link>
                </div>
            </header>

            <WorkspaceTour ready={Boolean(releaseWorldId)} activePanel={activePanel} onSelectPanel={setActivePanel} />

            <section
                className="signal-board-workspace signal-board-workspace-tracks-first"
                aria-label="Creative release workspace"
            >
                <section
                    ref={controlsRef}
                    className="signal-board-tool-dock"
                    aria-label="Signal board tool dock"
                >
                    <div className="signal-board-tool-dock-header">
                        <div>
                            <p className="signal-board-panel-kicker">Active Tool</p>
                            <h2>
                                {activePanel === "tracks"
                                    ? "Tracks"
                                    : activePanel === "assets"
                                        ? "Assets"
                                        : activePanel === "signals"
                                            ? "Studio Board"
                                            : "Release details"}
                            </h2>
                        </div>

                        <nav
                            className="signal-board-horizontal-tabs"
                            aria-label="Workspace tools"
                        >
                            <button
                                type="button"
                                data-workspace-tour="tracks"
                                aria-pressed={activePanel === "tracks"}
                                className={activePanel === "tracks" ? "is-active" : ""}
                                onClick={() => setActivePanel("tracks")}
                            >
                                <span>♪</span>
                                Tracks
                            </button>
                            <button
                                type="button"
                                data-workspace-tour="assets"
                                aria-pressed={activePanel === "assets"}
                                className={activePanel === "assets" ? "is-active" : ""}
                                onClick={() => setActivePanel("assets")}
                            >
                                <span>◈</span>
                                Assets
                            </button>
                            <button
                                type="button"
                                data-workspace-tour="signals"
                                aria-pressed={activePanel === "signals"}
                                className={activePanel === "signals" ? "is-active" : ""}
                                onClick={() => setActivePanel("signals")}
                            >
                                <span>✦</span>
                                Studio Board (optional)
                            </button>
                            <button
                                type="button"
                                aria-pressed={activePanel === "portal"}
                                className={activePanel === "portal" ? "is-active" : ""}
                                onClick={() => setActivePanel("portal")}
                            >
                                <span>◎</span>
                                Release details
                            </button>
                        </nav>


                    </div>

                    <div
                        className="signal-board-work-panel signal-board-work-panel-docked"
                        aria-label="Active tool panel"
                    >
                        {activePanel === "tracks" && (
                            <TrackWorkspace
                                isCreatingNewTrack={isCreatingNewTrack}
                                selectedTrack={selectedTrack}
                                handleNewTrack={handleNewTrack}
                                tracksError={tracksError}
                                trackMessage={trackMessage}
                                tracksLoading={tracksLoading}
                                releaseTracks={releaseTracks}
                                selectedTrackId={selectedTrackId}
                                handleSelectTrack={handleSelectTrack}
                                trackForm={trackForm}
                                updateTrackForm={updateTrackForm}
                                handleTrackArtworkDrop={handleTrackArtworkDrop}
                                selectedTrackArtworkAsset={selectedTrackArtworkAsset}
                                isUploadingTrackArtwork={isUploadingTrackArtwork}
                                trackArtworkMessage={trackArtworkMessage}
                                handleTrackArtworkFile={handleTrackArtworkFile}
                                trackRoleOptions={trackRoleOptions}
                                trackStatusOptions={trackStatusOptions}
                                handleManageTrackAudio={handleManageTrackAudio}
                                trackVisibilityOptions={trackVisibilityOptions}
                                playbackStatusOptions={playbackStatusOptions}
                                realmPublishingOptions={realmPublishingOptions}
                                realmFinderRealms={realmFinderRealms}
                                publishSignalState={publishSignalState}
                                isRealmFinderOpen={isRealmFinderOpen}
                                setIsRealmFinderOpen={setIsRealmFinderOpen}
                                realmFinderIsComplete={realmFinderIsComplete}
                                realmFinderQuestion={realmFinderQuestion}
                                realmFinderStep={realmFinderStep}
                                realmFinderQuestions={realmFinderQuestions}
                                realmFinderAnswers={realmFinderAnswers}
                                handleRealmFinderAnswer={handleRealmFinderAnswer}
                                setRealmFinderStep={setRealmFinderStep}
                                handleRealmFinderReset={handleRealmFinderReset}
                                realmFinderResult={realmFinderResult}
                                handleUseRealmFinderResult={handleUseRealmFinderResult}
                                publishSignalReadiness={publishSignalReadiness}
                                handleSubmitForNexusReview={handleSubmitForNexusReview}
                                isSubmittingNexusReview={isSubmittingNexusReview}
                                isCreatingTrack={isCreatingTrack}
                                isUpdatingTrack={isUpdatingTrack}
                                nexusReviewStatus={nexusReviewStatus}
                                handleSaveTrack={handleSaveTrack}
                                releaseWorldId={releaseWorldId}
                                handleDeleteTrack={handleDeleteTrack}
                                isDeletingTrack={isDeletingTrack}
                            />
                        )}
                        {activePanel === "assets" && (
                            <ReleaseAssetsPanel
                                slug={slug}
                                assetsError={assetsError}
                                assetMessage={assetMessage}
                                releaseWorld={releaseWorld}
                                releaseTitle={releaseTitle}
                                releaseAssets={releaseAssets}
                                coverAssets={coverAssets}
                                trackAudioAssets={trackAudioAssets}
                                releaseTracks={releaseTracks}
                                assetForm={assetForm}
                                handleAssetFileChange={handleAssetFileChange}
                                selectedAssetFile={selectedAssetFile}
                                assetUploadPreviewUrl={assetUploadPreviewUrl}
                                handleUploadAndCreateAsset={handleUploadAndCreateAsset}
                                isUploadingAsset={isUploadingAsset}
                                isCreatingAsset={isCreatingAsset}
                                releaseWorldId={releaseWorldId}
                                updateAssetForm={updateAssetForm}
                                assetUsageOptions={assetUsageOptions}
                                assetKindOptions={assetKindOptions}
                                handleCreateAsset={handleCreateAsset}
                                assetsLoading={assetsLoading}
                                getAssetUsageLabel={getAssetUsageLabel}
                                formatLabel={formatLabel}
                                isDeletingAsset={isDeletingAsset}
                                handleDeleteAsset={handleDeleteAsset}
                            />
                        )}

                        <StudioBoardWorkspace
                            activePanel={activePanel}
                            cloudStatus={cloudStatus}
                            handleReloadCloudBoard={handleReloadCloudBoard}
                            handleSaveToCloud={handleSaveToCloud}
                            isSaving={isSaving}
                            releaseWorldId={releaseWorldId}
                            cloudMessage={cloudMessage}
                            artifacts={artifacts}
                            releaseTracks={releaseTracks}
                            hookCounts={hookCounts}
                            boardRef={boardRef}
                            releaseTitle={releaseTitle}
                            selectedArtifactId={selectedArtifactId}
                            handleArtifactPointerDown={handleArtifactPointerDown}
                            deleteArtifact={deleteArtifact}
                            nudgeLayer={nudgeLayer}
                            selectedArtifact={selectedArtifact}
                            updateArtifact={updateArtifact}
                            colorOptions={colorOptions}
                            sizeOptions={sizeOptions}
                            layerOptions={layerOptions}
                            pageSectionOptions={pageSectionOptions}
                            resetBoard={resetBoard}
                            createMode={createMode}
                            setCreateMode={setCreateMode}
                            selectedTrackSlug={selectedTrackSlug}
                            setSelectedTrackSlug={setSelectedTrackSlug}
                            hookTargetOptions={hookTargetOptions}
                            hookTitle={hookTitle}
                            setHookTitle={setHookTitle}
                            hookDescription={hookDescription}
                            setHookDescription={setHookDescription}
                            addHook={addHook}
                            noteTag={noteTag}
                            setNoteTag={setNoteTag}
                            noteTitle={noteTitle}
                            setNoteTitle={setNoteTitle}
                            noteBody={noteBody}
                            setNoteBody={setNoteBody}
                            addNoteArtifact={addNoteArtifact}
                            selectedColor={selectedColor}
                            selectedSize={selectedSize}
                            getHookTargetTitle={getHookTargetTitle}
                            selectedLayer={selectedLayer}
                            setSelectedColor={setSelectedColor}
                            setSelectedSize={setSelectedSize}
                            setSelectedLayer={setSelectedLayer}
                            boardColor={boardColor}
                            applyStarterBoardColor={applyStarterBoardColor}
                        />

                        {activePanel === "portal" && (
                            <section className="signal-board-panel-section signal-board-portal-panel">
                                <div className="signal-board-panel-heading">
                                    <div>
                                        <p className="signal-board-panel-kicker">
                                            Release details
                                        </p>
                                        <h2>Release page copy</h2>
                                    </div>
                                    <Link href={`/releases/${slug}`}>Open Page</Link>
                                </div>

                                <p className="signal-board-panel-message">{portalMessage}</p>

                                <details className="signal-board-workspace-disclosure">
                                    <summary>Release page output</summary>
                                    <aside className="signal-board-release-output" aria-label="Release page output summary">
                                        <div className="signal-board-release-output-copy">
                                            <p className="signal-board-panel-kicker">Release Page Output</p>
                                            <h3>What the public portal is pulling from this board.</h3>
                                            <span>Portal settings, visible tracks, uploaded assets, and published artifacts become the fan-facing Release Page.</span>
                                        </div>

                                        <div className="signal-board-release-output-grid">
                                            {releasePageOutputStats.map((item) => (
                                                <div key={item.label}>
                                                    <span>{item.label}</span>
                                                    <strong>{item.value}</strong>
                                                </div>
                                            ))}
                                        </div>

                                        <Link href={`/releases/${slug}`}>Preview Portal</Link>
                                    </aside>

                                </details>

                                <div className="signal-board-portal-grid signal-board-portal-grid-compact">
                                    <label>
                                        Release title
                                        <input
                                            value={portalSettings.title}
                                            onChange={(event) =>
                                                updatePortalSetting("title", event.target.value)
                                            }
                                            placeholder="Release title"
                                        />
                                    </label>

                                    <label>
                                        Release type
                                        <select
                                            value={portalSettings.releaseType}
                                            onChange={(event) =>
                                                updatePortalSetting("releaseType", event.target.value)
                                            }
                                        >
                                            <option value="single">Single</option>
                                            <option value="ep">EP</option>
                                            <option value="album">Album</option>
                                            <option value="campaign">Campaign</option>
                                        </select>
                                    </label>

                                    <label className="signal-board-portal-wide">
                                        One-line summary
                                        <input
                                            value={portalSettings.oneLineSummary}
                                            onChange={(event) =>
                                                updatePortalSetting(
                                                    "oneLineSummary",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="The public-facing one-line promise of this release world."
                                        />
                                    </label>

                                    <label className="signal-board-portal-wide">
                                        Story
                                        <textarea
                                            value={portalSettings.story}
                                            onChange={(event) =>
                                                updatePortalSetting("story", event.target.value)
                                            }
                                            placeholder="Write the release-world story that should appear on the portal."
                                            rows={5}
                                        />
                                    </label>
                                </div>

                                <details className="signal-board-workspace-disclosure">
                                    <summary>Advanced release settings</summary>
                                    <p className="signal-board-field-note">Release-level focus, visibility, dates, and cover URL. Use Tracks for track focus and Assets for cover uploads. Prepare Release checks publication readiness.</p>
                                    <div className="signal-board-portal-grid signal-board-portal-grid-compact">
                                        <label>
                                            Status
                                            <select
                                                value={portalSettings.status}
                                                onChange={(event) =>
                                                    updatePortalSetting("status", event.target.value)
                                                }
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="released">Released</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </label>

                                        <label>
                                            Visibility
                                            <select
                                                value={portalSettings.visibility}
                                                onChange={(event) =>
                                                    updatePortalSetting("visibility", event.target.value)
                                                }
                                            >
                                                <option value="private">Private</option>
                                                <option value="unlisted">Unlisted</option>
                                                <option value="public">Public</option>
                                            </select>
                                        </label>

                                        <label>
                                            Current focus
                                            <input
                                                value={portalSettings.currentFocus}
                                                onChange={(event) =>
                                                    updatePortalSetting("currentFocus", event.target.value)
                                                }
                                                placeholder="Lead single / front door"
                                            />
                                        </label>

                                        <label>
                                            Second focus
                                            <input
                                                value={portalSettings.secondFocus}
                                                onChange={(event) =>
                                                    updatePortalSetting("secondFocus", event.target.value)
                                                }
                                                placeholder="Contrast signal"
                                            />
                                        </label>

                                        <label>
                                            Drop date
                                            <input
                                                type="date"
                                                value={portalSettings.fullDropDate}
                                                onChange={(event) =>
                                                    updatePortalSetting("fullDropDate", event.target.value)
                                                }
                                            />
                                        </label>


                                        <label className="signal-board-portal-wide">
                                            Cover Art URL
                                            <input
                                                value={portalSettings.coverArtUrl}
                                                onChange={(event) =>
                                                    updatePortalSetting("coverArtUrl", event.target.value)
                                                }
                                                placeholder="/cover.jpg or external image URL"
                                            />
                                        </label>

                                    </div>
                                </details>

                                <div className="signal-board-portal-save-bar" role="region" aria-label="Portal save controls">
                                    <div>
                                        <span className="signal-board-control-label">Portal changes</span>
                                        <small>Save these fields to update the Release Page.</small>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSavePortalSettings}
                                        disabled={isUpdatingPortal || !releaseWorldId}
                                    >
                                        {isUpdatingPortal ? "Saving Portal..." : "Save Portal"}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </section>
            </section>
        </main>
    );
}