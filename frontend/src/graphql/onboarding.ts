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
