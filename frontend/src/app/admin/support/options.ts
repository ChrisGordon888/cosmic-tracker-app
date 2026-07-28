import type {
    CreatorStatus,
    PlatformRole,
} from "@/graphql/admin";

export const PLATFORM_ROLE_OPTIONS: PlatformRole[] = [
    "listener",
    "creator",
    "admin",
    "owner",
];

export const CREATOR_STATUS_OPTIONS: CreatorStatus[] = [
    "none",
    "invited",
    "active",
    "suspended",
];
