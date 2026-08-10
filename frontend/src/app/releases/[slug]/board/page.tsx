"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { upload } from "@vercel/blob/client";
import "@/styles/signalBoard.css";

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
      realmId
      showInNexus
      nexusReviewStatus
      nexusSubmittedAt
      nexusReviewedAt
      nexusReviewNotes
      updatedAt
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

type ArtifactKind =
    | "center"
    | "realm"
    | "track"
    | "moon"
    | "visual"
    | "hook"
    | "action"
    | "portal"
    | "cover"
    | "note"
    | "image"
    | "lyric"
    | "asset";

type ArtifactColor =
    | "cream"
    | "sky"
    | "violet"
    | "gold"
    | "rose"
    | "mint"
    | "graphite";
type ArtifactSize = "sm" | "md" | "lg" | "xl";

interface ReleaseWorld {
    id: string;
    title: string;
    slug: string;
    releaseType: string;
    status: string;
    visibility: string;
    isFeatured: boolean;
    oneLineSummary?: string | null;
    story?: string | null;
    currentFocus?: string | null;
    secondFocus?: string | null;
    fullDropDate?: string | null;
    coverArtUrl?: string | null;
    coverAssetId?: string | null;
    updatedAt?: string | null;
    lastOpenedAt?: string | null;
}

interface ReleaseTrack {
    id: string;
    title: string;
    slug: string;
    trackNumber: number;
    role: string;
    status: string;
    bpm?: number | null;
    keySignature?: string | null;
    mood?: string | null;
    hook?: string | null;
    notes?: string | null;
    audioUrl?: string | null;
    previewAudioUrl?: string | null;
    platformUrl?: string | null;
    visibility: string;
    playbackStatus: string;
    dropDate?: string | null;
    unlockDate?: string | null;
    isFocusTrack: boolean;
    isSecondFocus: boolean;
    isPublic: boolean;
    realmId?: number | null;
    showInNexus: boolean;
    nexusRole: string;
    isRealmAnchor: boolean;
    isPublicPick: boolean;
    nexusSortOrder: number;
    nexusReviewStatus: string;
    nexusSubmittedAt?: string | null;
    nexusReviewedAt?: string | null;
    nexusReviewNotes?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastOpenedAt?: string | null;
}


interface TrackForm {
    title: string;
    trackNumber: string;
    role: string;
    status: string;
    bpm: string;
    keySignature: string;
    mood: string;
    hook: string;
    notes: string;
    audioUrl: string;
    previewAudioUrl: string;
    platformUrl: string;
    visibility: string;
    playbackStatus: string;
    dropDate: string;
    unlockDate: string;
    isFocusTrack: boolean;
    isSecondFocus: boolean;
    isPublic: boolean;
    realmId: string;
    showInNexus: boolean;
    nexusRole: string;
    isRealmAnchor: boolean;
    isPublicPick: boolean;
    nexusSortOrder: string;
}

interface ReleaseAsset {
    id: string;
    ownerId: string;
    releaseWorldId: string;
    trackId?: string | null;
    boardArtifactId?: string | null;
    kind: string;
    usage: string;
    title: string;
    description?: string | null;
    url: string;
    fileName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    isPublic: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastOpenedAt?: string | null;
}

interface AssetForm {
    title: string;
    usage: string;
    kind: string;
    url: string;
    fileName: string;
    mimeType: string;
    trackId: string;
    description: string;
    isPublic: boolean;
}

interface HookTargetOption {
    slug: string;
    title: string;
    meta: string;
    kind: "project" | "track" | "visual" | "rollout" | "portal";
}

interface PortalSettings {
    title: string;
    releaseType: string;
    status: string;
    visibility: string;
    oneLineSummary: string;
    story: string;
    currentFocus: string;
    secondFocus: string;
    fullDropDate: string;
    coverArtUrl: string;
    coverAssetId: string;
}

interface BoardArtifact {
    id: string;
    kind: ArtifactKind;
    eyebrow: string;
    title: string;
    body: string;
    meta?: string;
    href?: string;
    connectedTrackSlug?: string;
    x: number;
    y: number;
    rotate?: number;
    color?: ArtifactColor;
    size?: ArtifactSize;
    layer?: number;
    isGenerated?: boolean;
    isUserCreated?: boolean;
    isPublic?: boolean;
    pageSection?: string;
    pageOrder?: number;
}

interface StoredBoardState {
    boardColor: ArtifactColor;
    artifacts: BoardArtifact[];
}

interface MongoBoardArtifact {
    id: string;
    kind: ArtifactKind;
    eyebrow?: string | null;
    title: string;
    body?: string | null;
    meta?: string | null;
    href?: string | null;
    connectedTrackSlug?: string | null;
    position: {
        x: number;
        y: number;
        rotate: number;
    };
    style: {
        color: ArtifactColor;
        size: ArtifactSize;
        layer: number;
    };
    isGenerated: boolean;
    isUserCreated: boolean;
    isPublic: boolean;
    pageSection?: string | null;
    pageOrder?: number | null;
}

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


type RealmFinderRealmId = 303 | 202 | 101 | 55 | 44 | 0;

interface RealmFinderOption {
    id: string;
    label: string;
    detail: string;
    realms: RealmFinderRealmId[];
}

interface RealmFinderQuestion {
    id: string;
    prompt: string;
    eyebrow: string;
    options: RealmFinderOption[];
}

const realmFinderRealms: Record<
    RealmFinderRealmId,
    { name: string; summary: string; signals: string[] }
> = {
    303: {
        name: "Fractured Frontier",
        summary: "Raw pressure, rupture, survival, rebellion, and forward motion through instability.",
        signals: ["intense", "fractured", "defiant"],
    },
    202: {
        name: "The Veil",
        summary: "Mystery, liminal emotion, shadow, dream logic, and the feeling of moving between worlds.",
        signals: ["mysterious", "liminal", "dreamlike"],
    },
    101: {
        name: "Moonlit Roads",
        summary: "Reflection, longing, romance, memory, and emotional movement through a nocturnal landscape.",
        signals: ["reflective", "emotional", "wandering"],
    },
    55: {
        name: "Skybound City",
        summary: "Ambition, momentum, scale, confidence, futurism, and the energy of rising into something larger.",
        signals: ["expansive", "driven", "future-facing"],
    },
    44: {
        name: "Astral Bazaar",
        summary: "Color, exchange, play, sensuality, eclectic culture, charisma, and social movement.",
        signals: ["eclectic", "social", "vivid"],
    },
    0: {
        name: "InterSiddhi",
        summary: "Stillness, transcendence, ritual, spiritual depth, altered perspective, and inner-space exploration.",
        signals: ["transcendent", "meditative", "otherworldly"],
    },
};

const realmFinderQuestions: RealmFinderQuestion[] = [
    {
        id: "emotional-center",
        eyebrow: "01 · Emotional center",
        prompt: "What is the signal carrying at its core?",
        options: [
            { id: "pressure", label: "Pressure + release", detail: "Raw, urgent, defiant, breaking through.", realms: [303, 55] },
            { id: "mystery", label: "Mystery + shadow", detail: "Unclear edges, hidden meaning, dream-state emotion.", realms: [202, 0] },
            { id: "longing", label: "Longing + reflection", detail: "Memory, romance, distance, inner movement.", realms: [101, 202] },
            { id: "magnetism", label: "Magnetism + color", detail: "Charisma, play, seduction, social energy.", realms: [44, 55] },
        ],
    },
    {
        id: "movement",
        eyebrow: "02 · Movement",
        prompt: "How does the track move through its world?",
        options: [
            { id: "collision", label: "Collision", detail: "Jagged, volatile, confrontational.", realms: [303, 44] },
            { id: "drift", label: "Drift", detail: "Floating, liminal, dissolving between spaces.", realms: [202, 0] },
            { id: "journey", label: "Journey", detail: "A road, memory, emotional progression.", realms: [101, 55] },
            { id: "ascent", label: "Ascent", detail: "Climbing, accelerating, arriving, expanding.", realms: [55, 303] },
        ],
    },
    {
        id: "world",
        eyebrow: "03 · World",
        prompt: "Where does this signal feel most alive?",
        options: [
            { id: "ruins", label: "At the edge", detail: "Broken structures, danger, transformation.", realms: [303, 202] },
            { id: "night-road", label: "On a night road", detail: "Headlights, distance, rain, memory.", realms: [101, 202] },
            { id: "city", label: "Above the city", detail: "Lights, height, speed, possibility.", realms: [55, 44] },
            { id: "temple", label: "Inside the unseen", detail: "Ritual, inner space, altered awareness.", realms: [0, 202] },
        ],
    },
    {
        id: "social-energy",
        eyebrow: "04 · Social energy",
        prompt: "How close are other people to the signal?",
        options: [
            { id: "alone", label: "Almost completely alone", detail: "Private, internal, intimate.", realms: [101, 0] },
            { id: "hidden", label: "Present but obscured", detail: "Figures behind glass, masks, distance.", realms: [202, 101] },
            { id: "crowd", label: "Inside a living crowd", detail: "Exchange, fashion, movement, chemistry.", realms: [44, 55] },
            { id: "against", label: "Against the world", detail: "Defiance, conflict, proving something.", realms: [303, 55] },
        ],
    },
    {
        id: "aftertaste",
        eyebrow: "05 · Aftertaste",
        prompt: "What should remain after the signal ends?",
        options: [
            { id: "impact", label: "Impact", detail: "A hit of force, urgency, disruption.", realms: [303, 55] },
            { id: "haunting", label: "A haunting feeling", detail: "Questions, atmosphere, unresolved emotion.", realms: [202, 101] },
            { id: "glow", label: "A glow", detail: "Energy, attraction, color, possibility.", realms: [44, 55] },
            { id: "stillness", label: "Stillness", detail: "Space, awe, integration, transcendence.", realms: [0, 202] },
        ],
    },
];

function getRealmFinderResult(answers: Record<string, string>) {
    const scores: Record<RealmFinderRealmId, number> = {
        303: 0,
        202: 0,
        101: 0,
        55: 0,
        44: 0,
        0: 0,
    };

    realmFinderQuestions.forEach((question) => {
        const answerId = answers[question.id];
        const option = question.options.find((candidate) => candidate.id === answerId);
        if (!option) return;

        option.realms.forEach((realmId, index) => {
            scores[realmId] += index === 0 ? 2 : 1;
        });
    });

    const ranked = (Object.entries(scores) as Array<[string, number]>)
        .map(([realmId, score]) => ({
            realmId: Number(realmId) as RealmFinderRealmId,
            score,
        }))
        .sort((a, b) => b.score - a.score || a.realmId - b.realmId);

    const answeredCount = Object.keys(answers).length;
    const winner = ranked[0];
    const runnerUp = ranked[1];
    const maxPossible = Math.max(answeredCount * 2, 1);
    const confidence = Math.min(99, Math.round((winner.score / maxPossible) * 100));

    return {
        ...winner,
        confidence,
        runnerUp,
        meta: realmFinderRealms[winner.realmId],
    };
}


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

function getTrackTitle(slug: string, releaseWorld?: ReleaseWorld | null) {
    return (
        getProjectFocusOptions(releaseWorld).find((track) => track.slug === slug)
            ?.title ?? "Project Hook"
    );
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
    };
}

function getTrackInputFromForm(form: TrackForm) {
    const bpmValue = form.bpm.trim() ? Number(form.bpm) : null;

    return {
        title: form.title.trim(),
        trackNumber: form.trackNumber.trim() ? Number(form.trackNumber) : undefined,
        role: form.role,
        status: form.status,
        bpm: Number.isFinite(bpmValue) ? bpmValue : null,
        keySignature: form.keySignature.trim(),
        mood: form.mood.trim(),
        hook: form.hook.trim(),
        notes: form.notes.trim(),
        audioUrl: form.audioUrl.trim(),
        previewAudioUrl: form.previewAudioUrl.trim(),
        platformUrl: form.platformUrl.trim(),
        visibility: form.visibility,
        playbackStatus: form.playbackStatus,
        dropDate: form.dropDate || null,
        unlockDate: form.unlockDate || null,
        isFocusTrack: form.isFocusTrack,
        isSecondFocus: form.isSecondFocus,
        isPublic: form.visibility === "public" || form.visibility === "listed",
        realmId: form.realmId === "" ? null : Number(form.realmId),
        nexusSortOrder: form.nexusSortOrder.trim() ? Number(form.nexusSortOrder) : 999,
    };
}

interface PublishSignalCheck {
    key: string;
    label: string;
    ready: boolean;
    detail: string;
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

function BoardArtifactCard({
    artifact,
    isSelected,
    onPointerDown,
    onDelete,
    onLayerNudge,
}: {
    artifact: BoardArtifact;
    isSelected: boolean;
    onPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void;
    onDelete: (id: string) => void;
    onLayerNudge: (id: string, direction: -1 | 1) => void;
}) {
    const style = {
        "--pin-x": `${artifact.x}%`,
        "--pin-y": `${artifact.y}%`,
        "--pin-rotate": `${artifact.rotate ?? 0}deg`,
        "--pin-layer": artifact.layer ?? 4,
    } as CSSProperties;

    const className = [
        "signal-board-pin",
        `signal-board-pin-${artifact.kind}`,
        `signal-board-pin-color-${artifact.color ?? "cream"}`,
        `signal-board-pin-size-${artifact.size ?? "md"}`,
        artifact.isUserCreated ? "signal-board-pin-user" : "",
        artifact.isPublic ? "is-public-artifact" : "",
        isSelected ? "is-selected" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <article
            className={className}
            style={style}
            onPointerDown={(event) => onPointerDown(event, artifact.id)}
        >
            <div className="signal-board-pin-cap" />
            {artifact.isPublic && <span className="signal-board-page-badge">Page</span>}

            {artifact.isUserCreated && (
                <button
                    type="button"
                    className="signal-board-delete"
                    aria-label={`Delete ${artifact.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(artifact.id);
                    }}
                >
                    ×
                </button>
            )}

            {artifact.kind === "cover" && (
                <div className="signal-board-cover-stack">
                    <span>EP</span>
                    <span>01</span>
                    <span>02</span>
                </div>
            )}

            {artifact.kind === "hook" && (
                <div className="signal-board-hook-mark">“</div>
            )}

            <div className="signal-board-pin-content">
                <div className="signal-board-pin-topline">
                    <p className="signal-board-pin-eyebrow">{artifact.eyebrow}</p>
                    <span className="signal-board-layer-badge">
                        L{artifact.layer ?? 4}
                    </span>
                </div>
                <h2>{artifact.title}</h2>
                <p className="signal-board-pin-body">{artifact.body}</p>
            </div>

            <div className="signal-board-pin-footer">
                {artifact.meta && (
                    <span className="signal-board-pin-pill">{artifact.meta}</span>
                )}

                <div className="signal-board-pin-tools">
                    <button
                        type="button"
                        aria-label={`Move ${artifact.title} down one layer`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onLayerNudge(artifact.id, -1);
                        }}
                    >
                        −
                    </button>
                    <button
                        type="button"
                        aria-label={`Move ${artifact.title} up one layer`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onLayerNudge(artifact.id, 1);
                        }}
                    >
                        +
                    </button>
                </div>

                {artifact.href && (
                    <Link
                        href={artifact.href}
                        className="signal-board-pin-link"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                    >
                        Open
                    </Link>
                )}
            </div>
        </article>
    );
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
    const [trackForm, setTrackForm] = useState<TrackForm>(() =>
        getEmptyTrackForm(1),
    );
    const [trackMessage, setTrackMessage] = useState(
        "Tracks shape the public listening path. Set visibility, playback, dates, and audio before previewing the Release Page.",
    );

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

    const lockedReleaseTracks = useMemo(
        () =>
            visibleReleaseTracks.filter(
                (track) =>
                    track.playbackStatus === "locked" ||
                    track.playbackStatus === "coming-soon" ||
                    (track.playbackStatus === "preview" && !track.previewAudioUrl?.trim()),
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

        if (selectedTrack) {
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
        updateTrackForm("realmId", realmId);
        setTrackMessage(
            `Realm Finder suggested ${realmFinderResult.realmId} — ${realmFinderResult.meta.name}. Save the track when you are ready.`,
        );
        setIsRealmFinderOpen(false);
    }

    function updateTrackForm<K extends keyof TrackForm>(
        key: K,
        value: TrackForm[K],
    ) {
        setTrackForm((current) => ({
            ...current,
            [key]: value,
        }));
        setTrackMessage(
            "Unsaved track changes. Save Track to update the song layer.",
        );
    }

    function handleSelectTrack(track: ReleaseTrack) {
        setIsCreatingNewTrack(false);
        setSelectedTrackId(track.id);
        setTrackForm(getTrackFormFromReleaseTrack(track));
        setTrackMessage(
            `Editing Track ${String(track.trackNumber).padStart(2, "0")} — ${track.title}.`,
        );
    }

    function handleNewTrack() {
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

            const input = getTrackInputFromForm(formToSave);
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
                setIsCreatingNewTrack(false);
                setSelectedTrackId(savedTrack.id);
                setTrackForm(getTrackFormFromReleaseTrack(savedTrack));
                setTrackMessage(
                    successMessage ||
                        `Track saved: ${savedTrack.title}. Focus fields sync to the release portal when selected.`,
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

    function scrollToBoard() {
        boardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function scrollToControls() {
        controlsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const cloudMessage =
        releaseError?.message || boardError?.message || saveMessage;

    return (
        <main className="signal-board-shell signal-board-shell-compact">
            <header
                className="signal-board-command-bar"
                aria-label="Signal board command bar"
            >
                <div className="signal-board-command-left">
                    <Link href="/creator/projects">All Projects</Link>
                    <Link href={`/releases/${slug}`}>Release Page</Link>
                </div>

                <div className="signal-board-command-title">
                    <p className="signal-board-panel-kicker">Release World Board</p>
                    <h1>
                        {releaseWorld?.title
                            ? `${releaseWorld.title} Signal Board`
                            : "Release Signal Board"}
                    </h1>
                    <span>
                        {artifacts.length} artifacts • {releaseTracks.length} tracks • {releaseAssets.length} assets •{" "}
                        {cloudStatus}
                    </span>
                </div>

                <div className="signal-board-command-actions">
                    <button type="button" onClick={handleReloadCloudBoard}>
                        Reload
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveToCloud}
                        disabled={isSaving || !releaseWorldId}
                    >
                        {isSaving ? "Saving..." : "Save Board"}
                    </button>
                </div>
            </header>

            <section
                className="signal-board-workspace signal-board-workspace-board-first"
                aria-label="Board-first signal board workspace"
            >
                <div
                    className="signal-board-workspace-header signal-board-board-header"
                    aria-label="Workspace header"
                >
                    <div className="signal-board-workspace-title">
                        <p className="signal-board-panel-kicker">Studio Wall</p>
                        <h2>{releaseTitle}</h2>
                    </div>

                    <div className="signal-board-board-meta" aria-label="Board status">
                        <span>{artifacts.length} artifacts</span>
                        <span>{releaseTracks.length} tracks</span>
                        <span>{releaseAssets.length} assets</span>
                        <span>{cloudStatus}</span>
                    </div>
                </div>

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

                <aside className="signal-board-coverage" aria-label="Signal map and board coverage">
                    <div className="signal-board-coverage-copy">
                        <p className="signal-board-panel-kicker">Board Overview</p>
                        <h3>Signal map</h3>
                        <span>See where the world is developed and where the board still feels thin.</span>
                    </div>
                    <div className="signal-board-coverage-stats">
                        <div><span>Cards</span><strong>{artifacts.length}</strong></div>
                        <div><span>Public</span><strong>{artifacts.filter((artifact) => artifact.isPublic).length}</strong></div>
                        <div><span>Tracks</span><strong>{releaseTracks.length}</strong></div>
                        <div><span>Nexus live</span><strong>{releaseTracks.filter((track) => track.showInNexus).length}</strong></div>
                    </div>
                    <div className="signal-board-theme-map signal-board-coverage-map">
                        {hookCounts.map((target) => (
                            <div key={target.slug}>
                                <span>{target.title}</span>
                                <strong>{target.count}</strong>
                            </div>
                        ))}
                    </div>
                </aside>

                <section
                    className="signal-board-canvas-zone"
                    aria-label="Main interactive board stage"
                >
                    <div
                        className="signal-board-frame-scroll"
                        aria-label="Scrollable board area"
                    >
                        <section
                            ref={boardRef}
                            className="signal-board-frame signal-board-frame-compact"
                            aria-label={`${releaseTitle} signal board`}
                        >
                            <div className="signal-board-frame-glow" />
                            <div className="signal-board-texture" />
                            <div className="signal-board-thread signal-board-thread-a" />
                            <div className="signal-board-thread signal-board-thread-b" />
                            <div className="signal-board-thread signal-board-thread-c" />
                            <div className="signal-board-thread signal-board-thread-d" />
                            <div className="signal-board-thread signal-board-thread-e" />

                            {artifacts.map((artifact) => (
                                <BoardArtifactCard
                                    key={artifact.id}
                                    artifact={artifact}
                                    isSelected={artifact.id === selectedArtifactId}
                                    onPointerDown={handleArtifactPointerDown}
                                    onDelete={deleteArtifact}
                                    onLayerNudge={nudgeLayer}
                                />
                            ))}
                        </section>
                    </div>

                    {selectedArtifact && (
                        <div
                            className="signal-board-inspector-bar"
                            aria-label="Selected artifact inspector"
                        >
                            <div>
                                <p className="signal-board-panel-kicker">Selected Artifact</p>
                                <strong>{selectedArtifact.title}</strong>
                                <span>{selectedArtifact.eyebrow || selectedArtifact.kind}</span>
                            </div>

                            <label>
                                Color
                                <select
                                    value={selectedArtifact.color ?? "cream"}
                                    onChange={(event) =>
                                        updateArtifact(selectedArtifact.id, {
                                            color: event.target.value as ArtifactColor,
                                        })
                                    }
                                >
                                    {colorOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Size
                                <select
                                    value={selectedArtifact.size ?? "md"}
                                    onChange={(event) =>
                                        updateArtifact(selectedArtifact.id, {
                                            size: event.target.value as ArtifactSize,
                                        })
                                    }
                                >
                                    {sizeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Layer
                                <select
                                    value={selectedArtifact.layer ?? 4}
                                    onChange={(event) =>
                                        updateArtifact(selectedArtifact.id, {
                                            layer: Number(event.target.value),
                                        })
                                    }
                                >
                                    {layerOptions.map((layer) => (
                                        <option key={layer} value={layer}>
                                            {layer}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="signal-board-public-toggle">
                                Publish to Portal
                                <button
                                    type="button"
                                    className={selectedArtifact.isPublic ? "is-active" : ""}
                                    onClick={() =>
                                        updateArtifact(selectedArtifact.id, {
                                            isPublic: !selectedArtifact.isPublic,
                                        })
                                    }
                                >
                                    {selectedArtifact.isPublic ? "Showing" : "Hidden"}
                                </button>
                                <span className="signal-board-field-note">
                                    Showing publishes this card as a World Fragment on the Release Page.
                                </span>
                            </label>

                            <label>
                                Section
                                <select
                                    value={selectedArtifact.pageSection ?? "story"}
                                    onChange={(event) =>
                                        updateArtifact(selectedArtifact.id, {
                                            pageSection: event.target.value,
                                        })
                                    }
                                >
                                    {pageSectionOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Order
                                <select
                                    value={selectedArtifact.pageOrder ?? 1}
                                    onChange={(event) =>
                                        updateArtifact(selectedArtifact.id, {
                                            pageOrder: Number(event.target.value),
                                        })
                                    }
                                >
                                    {Array.from({ length: 12 }, (_, index) => index + 1).map((order) => (
                                        <option key={order} value={order}>
                                            {order}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
                </section>

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
                                    ? "Track Manager"
                                    : activePanel === "assets"
                                        ? "Asset Manager"
                                        : activePanel === "signals"
                                            ? "Create + Style"
                                            : "Portal Final Pass"}
                            </h2>
                        </div>

                        <nav
                            className="signal-board-horizontal-tabs"
                            aria-label="Workspace tools"
                        >
                            <button
                                type="button"
                                className={activePanel === "tracks" ? "is-active" : ""}
                                onClick={() => setActivePanel("tracks")}
                            >
                                <span>♪</span>
                                Tracks
                            </button>
                            <button
                                type="button"
                                className={activePanel === "assets" ? "is-active" : ""}
                                onClick={() => setActivePanel("assets")}
                            >
                                <span>◈</span>
                                Assets
                            </button>
                            <button
                                type="button"
                                className={activePanel === "signals" ? "is-active" : ""}
                                onClick={() => setActivePanel("signals")}
                            >
                                <span>✦</span>
                                Create
                            </button>
                            <button
                                type="button"
                                className={activePanel === "portal" ? "is-active" : ""}
                                onClick={() => setActivePanel("portal")}
                            >
                                <span>◎</span>
                                Portal
                            </button>
                        </nav>

                        <p className="signal-board-workspace-status">{cloudMessage}</p>
                    </div>

                    <div
                        className="signal-board-work-panel signal-board-work-panel-docked"
                        aria-label="Active tool panel"
                    >
                        {activePanel === "tracks" && (
                            <section className="signal-board-panel-section">
                                <div className="signal-board-panel-heading">
                                    <div>
                                        <p className="signal-board-panel-kicker">Track Manager</p>
                                        <h2>
                                            {isCreatingNewTrack
                                                ? "New track"
                                                : selectedTrack
                                                    ? "Edit track"
                                                    : "Tracks"}
                                        </h2>
                                    </div>
                                    <button type="button" onClick={handleNewTrack}>
                                        Start New
                                    </button>
                                </div>

                                <p className="signal-board-panel-message">
                                    {tracksError?.message || trackMessage}
                                </p>

                                <details className="signal-board-help-disclosure">
                                    <summary>How release controls work</summary>
                                    <div className="signal-board-help-grid">
                                        <span><strong>Visibility</strong> — Listed/Public appears on the Release Page.</span>
                                        <span><strong>Playback</strong> — Locked, preview, or full playable audio.</span>
                                        <span><strong>Dates</strong> — Drop and unlock timing shape listener access.</span>
                                    </div>
                                </details>

                                <div
                                    className="signal-board-track-strip"
                                    aria-label="Release tracks"
                                >
                                    {tracksLoading && (
                                        <p className="signal-board-empty-note">Loading tracks...</p>
                                    )}
                                    {!tracksLoading && releaseTracks.length === 0 && (
                                        <p className="signal-board-empty-note">
                                            No tracks yet. Start New to add the first song.
                                        </p>
                                    )}
                                    {releaseTracks.map((track) => (
                                        <button
                                            key={track.id}
                                            type="button"
                                            className={
                                                selectedTrackId === track.id && !isCreatingNewTrack
                                                    ? "is-active"
                                                    : ""
                                            }
                                            onClick={() => handleSelectTrack(track)}
                                        >
                                            <span>{String(track.trackNumber).padStart(2, "0")}</span>
                                            <strong>{track.title}</strong>
                                            <em>
                                                {track.role}
                                                {track.isFocusTrack ? " • Focus" : ""}
                                                {track.isSecondFocus ? " • Second" : ""}
                                                {track.showInNexus ? ` • Nexus${track.realmId === 0 || track.realmId ? ` / ${track.realmId}` : ""}` : ""}
                                            </em>
                                        </button>
                                    ))}
                                </div>

                                <div className="signal-board-track-workflow">
                                    <section className="signal-board-track-section-card">
                                        <div className="signal-board-track-section-heading">
                                            <div><p className="signal-board-panel-kicker">Song</p><h3>Shape the record</h3></div>
                                            <span>Identity, creative context, and production notes.</span>
                                        </div>
                                        <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                                        <label className="signal-board-wide-field">
                                            Title
                                            <input
                                                value={trackForm.title}
                                                onChange={(event) =>
                                                    updateTrackForm("title", event.target.value)
                                                }
                                                placeholder="Track title"
                                            />
                                        </label>
                                        <label>
                                            #
                                            <input
                                                type="number"
                                                min="1"
                                                value={trackForm.trackNumber}
                                                onChange={(event) =>
                                                    updateTrackForm("trackNumber", event.target.value)
                                                }
                                            />
                                        </label>
                                        <label>
                                            Role
                                            <select
                                                value={trackForm.role}
                                                onChange={(event) =>
                                                    updateTrackForm("role", event.target.value)
                                                }
                                            >
                                                {trackRoleOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label>
                                            Status
                                            <select
                                                value={trackForm.status}
                                                onChange={(event) =>
                                                    updateTrackForm("status", event.target.value)
                                                }
                                            >
                                                {trackStatusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label>
                                            BPM
                                            <input
                                                type="number"
                                                min="1"
                                                value={trackForm.bpm}
                                                onChange={(event) =>
                                                    updateTrackForm("bpm", event.target.value)
                                                }
                                                placeholder="140"
                                            />
                                        </label>
                                        <label>
                                            Key
                                            <input
                                                value={trackForm.keySignature}
                                                onChange={(event) =>
                                                    updateTrackForm("keySignature", event.target.value)
                                                }
                                                placeholder="F minor"
                                            />
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Mood
                                            <input
                                                value={trackForm.mood}
                                                onChange={(event) =>
                                                    updateTrackForm("mood", event.target.value)
                                                }
                                                placeholder="blue chrome night drive"
                                            />
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Hook
                                            <textarea
                                                value={trackForm.hook}
                                                onChange={(event) =>
                                                    updateTrackForm("hook", event.target.value)
                                                }
                                                rows={3}
                                                placeholder="Main hook or signal line"
                                            />
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Notes
                                            <textarea
                                                value={trackForm.notes}
                                                onChange={(event) =>
                                                    updateTrackForm("notes", event.target.value)
                                                }
                                                rows={3}
                                                placeholder="Production notes, story notes, rollout notes..."
                                            />
                                        </label>
                                        </div>
                                        <div className="signal-board-campaign-control">
                                            <span className="signal-board-control-label">Release focus</span>
                                            <div className="signal-board-campaign-toggles">
                                                <label className={trackForm.isFocusTrack ? "is-active" : ""}><input type="checkbox" checked={trackForm.isFocusTrack} onChange={(event) => updateTrackForm("isFocusTrack", event.target.checked)} /> Primary focus</label>
                                                <label className={trackForm.isSecondFocus ? "is-active" : ""}><input type="checkbox" checked={trackForm.isSecondFocus} onChange={(event) => updateTrackForm("isSecondFocus", event.target.checked)} /> Secondary focus</label>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="signal-board-track-section-card">
                                        <div className="signal-board-track-section-heading">
                                            <div><p className="signal-board-panel-kicker">Release</p><h3>Control the listener path</h3></div>
                                            <span>Visibility, playback, dates, audio, and destination links.</span>
                                        </div>
                                        <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                                        <label>
                                            Visibility
                                            <select
                                                value={trackForm.visibility}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    updateTrackForm("visibility", value);
                                                    updateTrackForm("isPublic", value === "public" || value === "listed");
                                                }}
                                            >
                                                {trackVisibilityOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="signal-board-field-note">
                                                Private stays hidden. Listed appears inside this release. Public can appear on broader surfaces later.
                                            </span>
                                        </label>
                                        <label>
                                            Playback
                                            <select
                                                value={trackForm.playbackStatus}
                                                onChange={(event) =>
                                                    updateTrackForm("playbackStatus", event.target.value)
                                                }
                                            >
                                                {playbackStatusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="signal-board-field-note">
                                                Locked shows the track without audio. Preview needs Preview Audio URL. Playable uses full Audio URL.
                                            </span>
                                        </label>
                                        <label>
                                            Drop Date
                                            <input
                                                type="date"
                                                value={trackForm.dropDate}
                                                onChange={(event) =>
                                                    updateTrackForm("dropDate", event.target.value)
                                                }
                                            />
                                        </label>
                                        <label>
                                            Unlock Date
                                            <input
                                                type="date"
                                                value={trackForm.unlockDate}
                                                onChange={(event) =>
                                                    updateTrackForm("unlockDate", event.target.value)
                                                }
                                            />
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Audio URL
                                            <input
                                                value={trackForm.audioUrl}
                                                onChange={(event) =>
                                                    updateTrackForm("audioUrl", event.target.value)
                                                }
                                                placeholder="/audio/song.mp3 or external URL"
                                            />
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Preview Audio URL
                                            <input
                                                value={trackForm.previewAudioUrl}
                                                onChange={(event) =>
                                                    updateTrackForm("previewAudioUrl", event.target.value)
                                                }
                                                placeholder="15–30 second teaser audio URL"
                                            />
                                            <span className="signal-board-field-note">
                                                Public preview uses this URL only. It will not fall back to the full track.
                                            </span>
                                        </label>
                                        <label className="signal-board-wide-field">
                                            Platform URL
                                            <input
                                                value={trackForm.platformUrl}
                                                onChange={(event) =>
                                                    updateTrackForm("platformUrl", event.target.value)
                                                }
                                                placeholder="Spotify, SoundCloud, YouTube, or pre-save link"
                                            />
                                        </label>
                                        </div>
                                    </section>

                                    <section className="signal-board-track-section-card signal-board-track-section-nexus">
                                        <div className="signal-board-track-section-heading">
                                            <div><p className="signal-board-panel-kicker">Nexus + Realm</p><h3>Prepare the signal</h3></div>
                                            <span>Choose the Realm that feels right, then submit the signal for Cosmic review when it is ready.</span>
                                        </div>

                                        <div className="signal-board-track-form-grid signal-board-track-form-grid-compact signal-board-nexus-grid">
                                            <label>
                                                Suggested Realm
                                                <select
                                                    value={trackForm.realmId}
                                                    onChange={(event) => updateTrackForm("realmId", event.target.value)}
                                                >
                                                    {realmPublishingOptions.map((option) => (
                                                        <option key={option.value || "none"} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="signal-board-field-note">
                                                    Choose the Realm you feel best matches the signal. Cosmic review can approve or adjust the final placement.
                                                </span>
                                            </label>

                                            <div className="signal-board-nexus-status">
                                                <span>Nexus review</span>
                                                <strong>{publishSignalState}</strong>
                                                <small>{trackForm.showInNexus ? "Live in Nexus" : "Creator submission workflow"}</small>
                                            </div>
                                        </div>

                                        <section className={`signal-board-realm-finder${isRealmFinderOpen ? " is-open" : ""}`}>
                                            <button
                                                type="button"
                                                className="signal-board-realm-finder-toggle"
                                                onClick={() => setIsRealmFinderOpen((current) => !current)}
                                                aria-expanded={isRealmFinderOpen}
                                            >
                                                <span>
                                                    <small>Realm Finder</small>
                                                    <strong>Need help choosing a Realm?</strong>
                                                </span>
                                                <em>{isRealmFinderOpen ? "Close" : "Find My Realm"}</em>
                                            </button>

                                            {isRealmFinderOpen && (
                                                <div className="signal-board-realm-finder-body">
                                                    {!realmFinderIsComplete ? (
                                                        <>
                                                            <div className="signal-board-realm-finder-progress">
                                                                <span>
                                                                    {realmFinderQuestion.eyebrow}
                                                                </span>
                                                                <strong>
                                                                    {realmFinderStep + 1} / {realmFinderQuestions.length}
                                                                </strong>
                                                            </div>

                                                            <div className="signal-board-realm-finder-question">
                                                                <h4>{realmFinderQuestion.prompt}</h4>
                                                                <p>Choose what feels closest. There is no permanent answer here.</p>
                                                            </div>

                                                            <div className="signal-board-realm-finder-options">
                                                                {realmFinderQuestion.options.map((option) => {
                                                                    const isSelected =
                                                                        realmFinderAnswers[realmFinderQuestion.id] === option.id;

                                                                    return (
                                                                        <button
                                                                            key={option.id}
                                                                            type="button"
                                                                            className={isSelected ? "is-selected" : ""}
                                                                            onClick={() =>
                                                                                handleRealmFinderAnswer(
                                                                                    realmFinderQuestion.id,
                                                                                    option.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <strong>{option.label}</strong>
                                                                            <span>{option.detail}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="signal-board-realm-finder-nav">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRealmFinderStep((current) =>
                                                                            Math.max(0, current - 1)
                                                                        )
                                                                    }
                                                                    disabled={realmFinderStep === 0}
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRealmFinderReset}
                                                                    disabled={Object.keys(realmFinderAnswers).length === 0}
                                                                >
                                                                    Start over
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="signal-board-realm-finder-result">
                                                            <div className="signal-board-realm-finder-result-topline">
                                                                <span>Suggested Realm</span>
                                                                <small>{realmFinderResult.confidence}% alignment</small>
                                                            </div>
                                                            <strong className="signal-board-realm-finder-result-title">
                                                                {realmFinderResult.realmId} — {realmFinderResult.meta.name}
                                                            </strong>
                                                            <p>{realmFinderResult.meta.summary}</p>

                                                            <div className="signal-board-realm-finder-signals">
                                                                {realmFinderResult.meta.signals.map((signal) => (
                                                                    <span key={signal}>{signal}</span>
                                                                ))}
                                                            </div>

                                                            <div className="signal-board-realm-finder-result-actions">
                                                                <button
                                                                    type="button"
                                                                    className="is-primary"
                                                                    onClick={handleUseRealmFinderResult}
                                                                >
                                                                    Use This Realm
                                                                </button>
                                                                <button type="button" onClick={handleRealmFinderReset}>
                                                                    Try Again
                                                                </button>
                                                            </div>

                                                            <small className="signal-board-realm-finder-disclaimer">
                                                                This is a creative sorting aid. You can still choose another Realm, and Cosmic review can adjust final Nexus placement.
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </section>

                                        <div className="signal-board-publish-guide signal-board-nexus-readiness" aria-label="Nexus review readiness">
                                            <article>
                                                <span>Nexus Review</span>
                                                <strong>{publishSignalState}</strong>
                                                <p>Submitting sends this track and your suggested Realm to Cosmic staff. Submission does not publish the track into Nexus.</p>
                                            </article>
                                            {publishSignalReadiness.checks.map((check) => (
                                                <article key={check.key}>
                                                    <span>{check.ready ? "Ready" : "Required"}</span>
                                                    <strong>{check.ready ? "✓ " : "• "}{check.label}</strong>
                                                    <p>{check.detail}</p>
                                                </article>
                                            ))}
                                        </div>

                                        {selectedTrack?.nexusReviewNotes && (
                                            <div className="signal-board-review-note">
                                                <span>Review note</span>
                                                <p>{selectedTrack.nexusReviewNotes}</p>
                                            </div>
                                        )}

                                        <div className="signal-board-panel-actions signal-board-publish-actions">
                                            <button
                                                type="button"
                                                onClick={() => void handleSubmitForNexusReview()}
                                                disabled={
                                                    isSubmittingNexusReview ||
                                                    isCreatingTrack ||
                                                    isUpdatingTrack ||
                                                    !selectedTrackId ||
                                                    isCreatingNewTrack ||
                                                    !publishSignalReadiness.ready ||
                                                    nexusReviewStatus === "in-review" ||
                                                    trackForm.showInNexus
                                                }
                                            >
                                                {isSubmittingNexusReview
                                                    ? "Submitting..."
                                                    : trackForm.showInNexus
                                                        ? "Published to Nexus"
                                                        : nexusReviewStatus === "in-review"
                                                            ? "Submitted for Review"
                                                            : nexusReviewStatus === "approved"
                                                                ? "Approved — Awaiting Publish"
                                                                : "Submit for Nexus Review"}
                                            </button>
                                        </div>
                                    </section>
                                </div>

                                <footer className="signal-board-track-footer">
                                    <div className="signal-board-track-save-copy">
                                        <span>{isCreatingNewTrack || !selectedTrackId ? "New track" : "Track changes"}</span>
                                        <strong>{isCreatingNewTrack || !selectedTrackId ? "Create this track when it is ready." : "Save the edits made to this track."}</strong>
                                    </div>

                                    <div className="signal-board-panel-actions signal-board-track-save-actions">
                                        <button type="button" onClick={() => void handleSaveTrack()} disabled={isCreatingTrack || isUpdatingTrack || !releaseWorldId}>
                                            {isCreatingTrack || isUpdatingTrack ? "Saving..." : isCreatingNewTrack || !selectedTrackId ? "Create Track" : "Update Track"}
                                        </button>
                                    </div>

                                    {selectedTrackId && !isCreatingNewTrack && (
                                        <div className="signal-board-track-danger-zone">
                                            <div>
                                                <span>Danger zone</span>
                                                <strong>Delete this track from the release workspace.</strong>
                                            </div>
                                            <button
                                                type="button"
                                                className="signal-board-danger-mini"
                                                onClick={handleDeleteTrack}
                                                disabled={isDeletingTrack}
                                            >
                                                {isDeletingTrack ? "Deleting..." : "Delete Track"}
                                            </button>
                                        </div>
                                    )}
                                </footer>
                            </section>
                        )}
                        {activePanel === "assets" && (
                            <section className="signal-board-panel-section signal-board-assets-panel">
                                <div className="signal-board-panel-heading">
                                    <div>
                                        <p className="signal-board-panel-kicker">Asset Manager</p>
                                        <h2>Cover, audio, and references</h2>
                                    </div>
                                    <Link href={`/releases/${slug}`}>View Page</Link>
                                </div>

                                <p className="signal-board-panel-message">
                                    {assetsError?.message || assetMessage}
                                </p>

                                <details className="signal-board-help-disclosure signal-board-asset-help">
                                    <summary>How assets flow through the release</summary>
                                    <div className="signal-board-help-grid">
                                        <span><strong>Cover art</strong> updates the release hero across public surfaces.</span>
                                        <span><strong>Track audio</strong> attaches playback directly to a song.</span>
                                        <span><strong>References</strong> can stay private or become public creative material later.</span>
                                    </div>
                                </details>

                                <div className="signal-board-asset-overview">
                                    <article className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                                        <p className="signal-board-panel-kicker">Current Cover</p>
                                        <h2>{releaseWorld?.coverArtUrl ? "Cover synced" : "No cover yet"}</h2>
                                        {releaseWorld?.coverArtUrl ? (
                                            <div className="signal-board-cover-preview">
                                                <img
                                                    src={releaseWorld.coverArtUrl}
                                                    alt={`${releaseTitle} cover preview`}
                                                />
                                                <span>{releaseWorld.coverArtUrl}</span>
                                            </div>
                                        ) : (
                                            <p className="signal-board-empty-note">
                                                Register a cover asset to update the release page hero.
                                            </p>
                                        )}
                                    </article>

                                    <article className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                                        <p className="signal-board-panel-kicker">Asset Totals</p>
                                        <h2>{releaseAssets.length} registered</h2>
                                        <div className="signal-board-theme-map">
                                            <div>
                                                <span>Cover</span>
                                                <strong>{coverAssets.length}</strong>
                                            </div>
                                            <div>
                                                <span>Audio</span>
                                                <strong>{trackAudioAssets.length}</strong>
                                            </div>
                                            <div>
                                                <span>Tracks</span>
                                                <strong>{releaseTracks.length}</strong>
                                            </div>
                                        </div>
                                    </article>
                                </div>

                                <div className="signal-board-upload-card" aria-label="Upload asset to Vercel Blob">
                                    <div className="signal-board-upload-copy">
                                        <p className="signal-board-panel-kicker">Cloud Upload</p>
                                        <h3>Upload a file from your computer</h3>
                                        <span>Uploads to Vercel Blob, then registers the returned URL as a ReleaseAsset.</span>
                                    </div>

                                    <label className="signal-board-file-drop">
                                        <input
                                            type="file"
                                            accept={
                                                assetForm.usage === "track-audio"
                                                    ? "audio/*"
                                                    : assetForm.usage === "track-artwork"
                                                        ? "image/*"
                                                    : assetForm.kind === "video"
                                                        ? "video/*"
                                                        : assetForm.kind === "document"
                                                            ? ".pdf,.txt,.doc,.docx"
                                                            : "image/*,audio/*,video/*,.pdf"
                                            }
                                            onChange={(event) =>
                                                handleAssetFileChange(event.currentTarget.files)
                                            }
                                        />
                                        <strong>{selectedAssetFile ? selectedAssetFile.name : "Choose file"}</strong>
                                        <span>Cover art, audio bounce, promo visual, or reference file</span>
                                    </label>

                                    {assetUploadPreviewUrl && (
                                        <div className="signal-board-upload-preview">
                                            <img src={assetUploadPreviewUrl} alt="Selected asset preview" />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleUploadAndCreateAsset}
                                        disabled={isUploadingAsset || isCreatingAsset || !releaseWorldId || !selectedAssetFile}
                                    >
                                        {isUploadingAsset ? "Uploading..." : "Upload + Register Asset"}
                                    </button>
                                </div>

                                <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                                    <label className="signal-board-wide-field">
                                        Asset title
                                        <input
                                            value={assetForm.title}
                                            onChange={(event) =>
                                                updateAssetForm("title", event.target.value)
                                            }
                                            placeholder="Cover art, demo bounce, visual reference..."
                                        />
                                    </label>

                                    <label>
                                        Usage
                                        <select
                                            value={assetForm.usage}
                                            onChange={(event) =>
                                                updateAssetForm("usage", event.target.value)
                                            }
                                        >
                                            {assetUsageOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Kind
                                        <select
                                            value={assetForm.kind}
                                            onChange={(event) =>
                                                updateAssetForm("kind", event.target.value)
                                            }
                                        >
                                            {assetKindOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    {["track-audio", "track-artwork"].includes(assetForm.usage) && (
                                        <label className="signal-board-wide-field">
                                            Attach to track
                                            <select
                                                value={assetForm.trackId}
                                                onChange={(event) =>
                                                    updateAssetForm("trackId", event.target.value)
                                                }
                                            >
                                                <option value="">Choose track</option>
                                                {releaseTracks.map((track) => (
                                                    <option key={track.id} value={track.id}>
                                                        {String(track.trackNumber).padStart(2, "0")} — {track.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    )}

                                    <label className="signal-board-wide-field">
                                        Asset URL
                                        <input
                                            value={assetForm.url}
                                            onChange={(event) =>
                                                updateAssetForm("url", event.target.value)
                                            }
                                            placeholder="/cover.jpg, /music/demo.mp3, or external URL"
                                        />
                                    </label>

                                    <label>
                                        File name
                                        <input
                                            value={assetForm.fileName}
                                            onChange={(event) =>
                                                updateAssetForm("fileName", event.target.value)
                                            }
                                            placeholder="cover.jpg"
                                        />
                                    </label>

                                    <label>
                                        MIME type
                                        <input
                                            value={assetForm.mimeType}
                                            onChange={(event) =>
                                                updateAssetForm("mimeType", event.target.value)
                                            }
                                            placeholder="image/jpeg or audio/mpeg"
                                        />
                                    </label>

                                    <label className="signal-board-wide-field">
                                        Description
                                        <textarea
                                            value={assetForm.description}
                                            onChange={(event) =>
                                                updateAssetForm("description", event.target.value)
                                            }
                                            rows={3}
                                            placeholder="What is this asset for?"
                                        />
                                    </label>
                                </div>

                                <div className="signal-board-asset-visibility">
                                    <div>
                                        <span className="signal-board-control-label">Visibility</span>
                                        <small>{assetForm.isPublic ? "Available to public release surfaces" : "Private to the creator workspace"}</small>
                                    </div>
                                    <label className={assetForm.isPublic ? "is-active" : ""}>
                                        <input
                                            type="checkbox"
                                            checked={assetForm.isPublic}
                                            onChange={(event) =>
                                                updateAssetForm("isPublic", event.target.checked)
                                            }
                                        />
                                        Public asset
                                    </label>
                                </div>

                                <div className="signal-board-panel-actions">
                                    <button
                                        type="button"
                                        onClick={handleCreateAsset}
                                        disabled={isCreatingAsset || !releaseWorldId}
                                    >
                                        {isCreatingAsset ? "Registering..." : "Register Asset"}
                                    </button>
                                </div>

                                <div className="signal-board-asset-list" aria-label="Registered assets">
                                    {assetsLoading && (
                                        <p className="signal-board-empty-note">Loading assets...</p>
                                    )}
                                    {!assetsLoading && releaseAssets.length === 0 && (
                                        <p className="signal-board-empty-note">
                                            No assets yet. Register a cover URL or track audio URL to start.
                                        </p>
                                    )}
                                    {releaseAssets.map((asset) => {
                                        const attachedTrack = releaseTracks.find(
                                            (track) => track.id === asset.trackId,
                                        );

                                        return (
                                            <article key={asset.id} className="signal-board-asset-card">
                                                <div className="signal-board-asset-card-copy">
                                                    <p className="signal-board-panel-kicker">
                                                        {getAssetUsageLabel(asset.usage)} / {formatLabel(asset.kind)}
                                                    </p>
                                                    <h3>{asset.title}</h3>
                                                    {asset.description && <p>{asset.description}</p>}
                                                    {attachedTrack && <span>Attached to {attachedTrack.title}</span>}
                                                    <span>{asset.fileName || asset.url}</span>
                                                </div>

                                                <div className="signal-board-asset-card-actions">
                                                    <a href={asset.url} target="_blank" rel="noreferrer">
                                                        Open
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="signal-board-danger-mini signal-board-asset-delete"
                                                        disabled={isDeletingAsset}
                                                        onClick={() => handleDeleteAsset(asset)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {activePanel === "signals" && (
                            <section className="signal-board-panel-section signal-board-create-panel">
                                <div className="signal-board-panel-heading">
                                    <div>
                                        <p className="signal-board-panel-kicker">Create + Style</p>
                                        <h2>Build a signal card</h2>
                                        <p>Write the idea, choose how it should feel, then add exactly that card to the board.</p>
                                    </div>
                                    <button type="button" onClick={resetBoard}>Reset Starter Board</button>
                                </div>

                                <div className="signal-board-create-layout">
                                    <div className="signal-board-create-compose">
                                        <div className="signal-board-create-mode" role="tablist" aria-label="Signal card type">
                                            <button type="button" className={createMode === "hook" ? "is-active" : ""} onClick={() => setCreateMode("hook")}>Hook</button>
                                            <button type="button" className={createMode === "note" ? "is-active" : ""} onClick={() => setCreateMode("note")}>Note</button>
                                        </div>

                                        {createMode === "hook" ? (
                                            <div className="signal-board-toolbox-card signal-board-toolbox-card-flat signal-board-create-form">
                                                <p className="signal-board-panel-kicker">Hook Lab</p>
                                                <h2>Add hook artifact</h2>
                                                <label>Attach to
                                                    <select value={selectedTrackSlug} onChange={(event) => setSelectedTrackSlug(event.target.value)}>
                                                        {hookTargetOptions.map((target) => (<option key={target.slug} value={target.slug}>{target.title}</option>))}
                                                    </select>
                                                </label>
                                                <label>Title<input value={hookTitle} onChange={(event) => setHookTitle(event.target.value)} placeholder="Short hook title" /></label>
                                                <label>Signal<textarea value={hookDescription} onChange={(event) => setHookDescription(event.target.value)} placeholder="Hook, phrase, theme, or lyric..." rows={3} /></label>
                                                <button type="button" onClick={addHook}>Add Hook</button>
                                            </div>
                                        ) : (
                                            <div className="signal-board-toolbox-card signal-board-toolbox-card-flat signal-board-create-form">
                                                <p className="signal-board-panel-kicker">Artifact Drop</p>
                                                <h2>Add custom note</h2>
                                                <label>Tag<input value={noteTag} onChange={(event) => setNoteTag(event.target.value)} placeholder="Visual idea, symbol, rollout..." /></label>
                                                <label>Title<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Short artifact title" /></label>
                                                <label>Note<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="Idea, symbol, clip thought, or reminder..." rows={3} /></label>
                                                <button type="button" onClick={addNoteArtifact}>Add Note</button>
                                            </div>
                                        )}
                                    </div>

                                    <aside className="signal-board-create-style">
                                        <div className={`signal-board-card-preview signal-board-pin-color-${selectedColor} signal-board-card-preview-${selectedSize}`}>
                                            <span>{createMode === "hook" ? "Hook" : noteTag || "Note"}</span>
                                            <strong>{createMode === "hook" ? hookTitle || "Your next hook" : noteTitle || "Your next note"}</strong>
                                            <p>{createMode === "hook" ? hookDescription || `Attached to ${getHookTargetTitle(selectedTrackSlug, hookTargetOptions)}` : noteBody || "Add the idea, visual, or reminder."}</p>
                                            <em>{sizeOptions.find((option) => option.value === selectedSize)?.label} • Layer {selectedLayer}</em>
                                        </div>

                                        <div className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                                            <p className="signal-board-panel-kicker">Card Appearance</p>
                                            <h2>Style before you drop</h2>
                                            <div className="signal-board-style-row" aria-label="New card color">
                                                {colorOptions.map((option) => (
                                                    <button key={option.value} type="button" className={`signal-board-swatch signal-board-swatch-${option.value} ${selectedColor === option.value ? "is-active" : ""}`} onClick={() => setSelectedColor(option.value)}>{option.label}</button>
                                                ))}
                                            </div>
                                            <div className="signal-board-size-row" aria-label="New card size">
                                                {sizeOptions.map((option) => (
                                                    <button key={option.value} type="button" className={selectedSize === option.value ? "is-active" : ""} onClick={() => setSelectedSize(option.value)}>{option.label}</button>
                                                ))}
                                            </div>
                                            <label>Layer priority
                                                <select value={selectedLayer} onChange={(event) => setSelectedLayer(Number(event.target.value))}>
                                                    {layerOptions.map((layer) => (<option key={layer} value={layer}>Layer {layer}</option>))}
                                                </select>
                                            </label>
                                        </div>

                                        <details className="signal-board-style-disclosure">
                                            <summary>Starter board theme</summary>
                                            <div className="signal-board-style-disclosure-body">
                                                <div className="signal-board-style-row" aria-label="Starter board color">
                                                    {colorOptions.map((option) => (
                                                        <button key={option.value} type="button" className={`signal-board-swatch signal-board-swatch-${option.value} ${boardColor === option.value ? "is-active" : ""}`} onClick={() => applyStarterBoardColor(option.value)}>{option.label}</button>
                                                    ))}
                                                </div>
                                                <p className="signal-board-tool-note">Generated starter cards only.</p>
                                            </div>
                                        </details>
                                    </aside>
                                </div>
                            </section>
                        )}

                        {activePanel === "portal" && (
                            <section className="signal-board-panel-section signal-board-portal-panel">
                                <div className="signal-board-panel-heading">
                                    <div>
                                        <p className="signal-board-panel-kicker">
                                            Portal Final Pass
                                        </p>
                                        <h2>Release page copy</h2>
                                    </div>
                                    <Link href={`/releases/${slug}`}>Open Page</Link>
                                </div>

                                <p className="signal-board-panel-message">{portalMessage}</p>

                                <div className="signal-board-portal-output-card" aria-label="Portal output preview">
                                    <div>
                                        <p className="signal-board-panel-kicker">Public Portal Source</p>
                                        <h3>{portalSettings.title || releaseTitle}</h3>
                                        <span>These fields feed the Release Page hero, story block, cover art, and opening date.</span>
                                    </div>
                                    <div className="signal-board-portal-output-stats">
                                        <span>{visibleReleaseTracks.length} visible track{visibleReleaseTracks.length === 1 ? "" : "s"}</span>
                                        <span>{publishedArtifacts.length} fragment{publishedArtifacts.length === 1 ? "" : "s"}</span>
                                        <span>{releaseWorld?.coverArtUrl ? "Cover added" : "Cover needed"}</span>
                                    </div>
                                </div>

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