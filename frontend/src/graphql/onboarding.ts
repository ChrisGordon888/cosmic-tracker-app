"use client";

import { gql } from "@apollo/client";

export const GET_CREATOR_ONBOARDING_PROFILE = gql`
    query GetCreatorOnboardingProfile {
        getCreatorOnboardingProfile {
            id
            artistName
            slug
            displayName
            tagline
            bio
            isPublic
            isFeatured
            createdAt
            updatedAt
        }
    }
`;

export const SAVE_CREATOR_ONBOARDING_PROFILE = gql`
    mutation SaveCreatorOnboardingProfile(
        $input: CreatorOnboardingProfileInput!
    ) {
        saveCreatorOnboardingProfile(input: $input) {
            id
            artistName
            slug
            displayName
            tagline
            bio
            isPublic
            isFeatured
            createdAt
            updatedAt
        }
    }
`;

export const GET_CREATOR_ONBOARDING_RELEASE = gql`
    query GetCreatorOnboardingRelease {
        getCreatorOnboardingRelease {
            id
            creativeProfileId
            title
            slug
            releaseType
            status
            visibility
            isFeatured
            oneLineSummary
            story
            fullDropDate
            coverArtUrl
            coverAssetId
            createdAt
            updatedAt
        }
    }
`;

export const SAVE_CREATOR_ONBOARDING_RELEASE = gql`
    mutation SaveCreatorOnboardingRelease(
        $input: CreatorOnboardingReleaseInput!
    ) {
        saveCreatorOnboardingRelease(input: $input) {
            id
            creativeProfileId
            title
            slug
            releaseType
            status
            visibility
            isFeatured
            oneLineSummary
            story
            fullDropDate
            coverArtUrl
            coverAssetId
            createdAt
            updatedAt
        }
    }
`;

export const GET_CREATOR_ONBOARDING_TRACK = gql`
    query GetCreatorOnboardingTrack {
        getCreatorOnboardingTrack {
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
            hook
            notes
            visibility
            playbackStatus
            isFocusTrack
            isPublic
            showInNexus
            createdAt
            updatedAt
        }
    }
`;

export const SAVE_CREATOR_ONBOARDING_TRACK = gql`
    mutation SaveCreatorOnboardingTrack(
        $input: CreatorOnboardingTrackInput!
    ) {
        saveCreatorOnboardingTrack(input: $input) {
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
            hook
            notes
            visibility
            playbackStatus
            isFocusTrack
            isPublic
            showInNexus
            createdAt
            updatedAt
        }
    }
`;

export const GET_CREATOR_ONBOARDING_ARTWORK = gql`
    query GetCreatorOnboardingArtwork {
        getCreatorOnboardingArtwork {
            id
            releaseWorldId
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
        }
    }
`;

export const SAVE_CREATOR_ONBOARDING_ARTWORK = gql`
    mutation SaveCreatorOnboardingArtwork(
        $input: CreatorOnboardingArtworkInput!
    ) {
        saveCreatorOnboardingArtwork(input: $input) {
            id
            releaseWorldId
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
        }
    }
`;

export const GET_CREATOR_ONBOARDING_REVIEW = gql`
    query GetCreatorOnboardingReview {
        getCreatorOnboardingProgress {
            status
            completedSteps
            completedCount
            totalSteps
            isReadyForActivation
            nextStepId
            nextStepLabel
            nextStepHref
            profileId
            releaseWorldId
            releaseWorldSlug
            trackId
        }
        getCreatorOnboardingProfile {
            id
            artistName
            slug
            displayName
            tagline
            bio
            isPublic
        }
        getCreatorOnboardingRelease {
            id
            title
            slug
            releaseType
            status
            visibility
            oneLineSummary
            story
            fullDropDate
            coverArtUrl
            coverAssetId
        }
        getCreatorOnboardingTrack {
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
            visibility
            playbackStatus
            isPublic
            showInNexus
        }
        getCreatorOnboardingArtwork {
            id
            title
            description
            url
            fileName
            mimeType
            isPublic
        }
    }
`;

export const GET_CREATOR_ONBOARDING_PROGRESS = gql`
    query GetCreatorOnboardingProgress {
        getCreatorOnboardingProgress {
            status
            completedSteps
            completedCount
            totalSteps
            isReadyForActivation
            nextStepId
            nextStepLabel
            nextStepHref
            profileId
            releaseWorldId
            releaseWorldSlug
            trackId
        }
    }
`;

export type CreatorOnboardingStatus =
    | "not-started"
    | "in-progress"
    | "ready"
    | "complete";

export type CreatorOnboardingProgress = {
    status: CreatorOnboardingStatus;
    completedSteps: string[];
    completedCount: number;
    totalSteps: number;
    isReadyForActivation: boolean;
    nextStepId?: string | null;
    nextStepLabel?: string | null;
    nextStepHref?: string | null;
    profileId?: string | null;
    releaseWorldId?: string | null;
    releaseWorldSlug?: string | null;
    trackId?: string | null;
};

export type CreatorOnboardingProgressData = {
    getCreatorOnboardingProgress: CreatorOnboardingProgress;
};


export type CreatorOnboardingProfile = {
    id: string;
    artistName: string;
    slug: string;
    displayName?: string | null;
    tagline?: string | null;
    bio?: string | null;
    isPublic: boolean;
    isFeatured: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type CreatorOnboardingProfileData = {
    getCreatorOnboardingProfile?: CreatorOnboardingProfile | null;
};

export type CreatorOnboardingProfileInput = {
    artistName: string;
    slug: string;
    displayName?: string | null;
    tagline?: string | null;
    bio?: string | null;
    isPublic?: boolean | null;
};

export type SaveCreatorOnboardingProfileData = {
    saveCreatorOnboardingProfile: CreatorOnboardingProfile;
};

export type SaveCreatorOnboardingProfileVariables = {
    input: CreatorOnboardingProfileInput;
};


export type CreatorOnboardingRelease = {
    id: string;
    creativeProfileId: string;
    title: string;
    slug: string;
    releaseType: string;
    status: string;
    visibility: string;
    isFeatured: boolean;
    oneLineSummary?: string | null;
    story?: string | null;
    fullDropDate?: string | null;
    coverArtUrl?: string | null;
    coverAssetId?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type CreatorOnboardingReleaseData = {
    getCreatorOnboardingRelease?: CreatorOnboardingRelease | null;
};

export type CreatorOnboardingReleaseInput = {
    title: string;
    slug: string;
    releaseType?: string | null;
    oneLineSummary?: string | null;
    story?: string | null;
    fullDropDate?: string | null;
};

export type SaveCreatorOnboardingReleaseData = {
    saveCreatorOnboardingRelease: CreatorOnboardingRelease;
};

export type SaveCreatorOnboardingReleaseVariables = {
    input: CreatorOnboardingReleaseInput;
};


export type CreatorOnboardingTrack = {
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
    hook?: string | null;
    notes?: string | null;
    visibility: string;
    playbackStatus: string;
    isFocusTrack: boolean;
    isPublic: boolean;
    showInNexus: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type CreatorOnboardingTrackData = {
    getCreatorOnboardingTrack?: CreatorOnboardingTrack | null;
};

export type CreatorOnboardingTrackInput = {
    title: string;
    slug?: string | null;
    role?: string | null;
    bpm?: number | null;
    keySignature?: string | null;
    mood?: string | null;
    hook?: string | null;
    notes?: string | null;
};

export type SaveCreatorOnboardingTrackData = {
    saveCreatorOnboardingTrack: CreatorOnboardingTrack;
};

export type SaveCreatorOnboardingTrackVariables = {
    input: CreatorOnboardingTrackInput;
};


export type CreatorOnboardingArtwork = {
    id: string;
    releaseWorldId: string;
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
};

export type CreatorOnboardingArtworkData = {
    getCreatorOnboardingArtwork?: CreatorOnboardingArtwork | null;
};

export type CreatorOnboardingArtworkInput = {
    title?: string | null;
    description?: string | null;
    url: string;
    fileName?: string | null;
    mimeType?: string | null;
    size?: number | null;
};

export type SaveCreatorOnboardingArtworkData = {
    saveCreatorOnboardingArtwork: CreatorOnboardingArtwork;
};

export type SaveCreatorOnboardingArtworkVariables = {
    input: CreatorOnboardingArtworkInput;
};


export type CreatorOnboardingReviewData = {
    getCreatorOnboardingProgress: CreatorOnboardingProgress;
    getCreatorOnboardingProfile?: CreatorOnboardingProfile | null;
    getCreatorOnboardingRelease?: CreatorOnboardingRelease | null;
    getCreatorOnboardingTrack?: CreatorOnboardingTrack | null;
    getCreatorOnboardingArtwork?: CreatorOnboardingArtwork | null;
};


export const GET_RELEASE_PUBLISHING_READINESS = gql`
    query GetReleasePublishingReadiness($releaseWorldId: ID!) {
        getReleasePublishingReadiness(
            releaseWorldId: $releaseWorldId
        ) {
            ready
            score
            completedChecks
            profileId
            releaseWorldId
            trackCount
            artworkId
            blockingIssues {
                code
                message
                severity
                field
                href
            }
            warnings {
                code
                message
                severity
                field
                href
            }
        }
    }
`;

export type ReleasePublishingIssue = {
    code: string;
    message: string;
    severity: string;
    field?: string | null;
    href?: string | null;
};

export type ReleasePublishingReadiness = {
    ready: boolean;
    score: number;
    completedChecks: string[];
    blockingIssues: ReleasePublishingIssue[];
    warnings: ReleasePublishingIssue[];
    profileId?: string | null;
    releaseWorldId: string;
    trackCount: number;
    artworkId?: string | null;
};

export type ReleasePublishingReadinessData = {
    getReleasePublishingReadiness: ReleasePublishingReadiness;
};

export type ReleasePublishingReadinessVariables = {
    releaseWorldId: string;
};


export const PUBLISH_RELEASE_WORLD = gql`
    mutation PublishReleaseWorld($releaseWorldId: ID!) {
        publishReleaseWorld(
            releaseWorldId: $releaseWorldId
        ) {
            id
            title
            slug
            status
            visibility
            updatedAt
        }
    }
`;

export const UNPUBLISH_RELEASE_WORLD = gql`
    mutation UnpublishReleaseWorld($releaseWorldId: ID!) {
        unpublishReleaseWorld(
            releaseWorldId: $releaseWorldId
        ) {
            id
            title
            slug
            status
            visibility
            updatedAt
        }
    }
`;

export type PublishReleaseWorldData = {
    publishReleaseWorld: {
        id: string;
        title: string;
        slug: string;
        status: string;
        visibility: string;
        updatedAt?: string | null;
    };
};

export type UnpublishReleaseWorldData = {
    unpublishReleaseWorld: {
        id: string;
        title: string;
        slug: string;
        status: string;
        visibility: string;
        updatedAt?: string | null;
    };
};

export type PublishReleaseWorldVariables = {
    releaseWorldId: string;
};
