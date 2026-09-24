export type ArtifactKind =
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

export type ArtifactColor =
    | "cream"
    | "sky"
    | "violet"
    | "gold"
    | "rose"
    | "mint"
    | "graphite";

export type ArtifactSize = "sm" | "md" | "lg" | "xl";

export interface ReleaseWorld {
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

export interface ReleaseTrack {
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
    realmFinderSuggestedRealmId?: number | null;
    realmFinderSecondaryRealmId?: number | null;
    realmFinderTraceRealmId?: number | null;
    realmFinderAlignment?: number | null;
    realmFinderSignals?: string[] | null;
    realmFinderSummary?: string | null;
    realmFinderDominantSignal?: string | null;
    realmFinderExplanation?: string | null;
    realmFinderScores?: RealmFinderScores | null;
    realmFinderVersion?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastOpenedAt?: string | null;
}

export interface RealmFinderScores {
    realm303: number;
    realm202: number;
    realm101: number;
    realm55: number;
    realm44: number;
    realm0: number;
}

export interface TrackForm {
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
    realmFinderSuggestedRealmId: string;
    realmFinderSecondaryRealmId: string;
    realmFinderTraceRealmId: string;
    realmFinderAlignment: string;
    realmFinderSignals: string[];
    realmFinderSummary: string;
    realmFinderDominantSignal: string;
    realmFinderExplanation: string;
    realmFinderScores: RealmFinderScores | null;
    realmFinderVersion: string;
}

export interface ReleaseAsset {
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

export interface AssetForm {
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

export interface HookTargetOption {
    slug: string;
    title: string;
    meta: string;
    kind: "project" | "track" | "visual" | "rollout" | "portal";
}

export interface PortalSettings {
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

export interface BoardArtifact {
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

export interface StoredBoardState {
    boardColor: ArtifactColor;
    artifacts: BoardArtifact[];
}

export interface MongoBoardArtifact {
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

export type RealmFinderRealmId = 303 | 202 | 101 | 55 | 44 | 0;

export interface RealmFinderOption {
    id: string;
    label: string;
    detail: string;
    realms: RealmFinderRealmId[];
}

export interface RealmFinderQuestion {
    id: string;
    prompt: string;
    eyebrow: string;
    options: RealmFinderOption[];
}

export interface PublishSignalCheck {
    key: string;
    label: string;
    ready: boolean;
    detail: string;
}
