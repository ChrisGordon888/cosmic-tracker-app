"use client";

import { gql } from "@apollo/client";

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
