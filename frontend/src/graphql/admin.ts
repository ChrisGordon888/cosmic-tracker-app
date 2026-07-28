"use client";

import { gql } from "@apollo/client";

export const PLATFORM_USERS_QUERY = gql`
    query PlatformUsers(
        $role: String
        $creatorStatus: String
        $search: String
    ) {
        platformUsers(
            role: $role
            creatorStatus: $creatorStatus
            search: $search
        ) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const PLATFORM_USER_QUERY = gql`
    query PlatformUser($id: ID!) {
        platformUser(id: $id) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const INVITE_CREATOR_MUTATION = gql`
    mutation InviteCreator($userId: ID!) {
        inviteCreator(userId: $userId) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const ACTIVATE_CREATOR_MUTATION = gql`
    mutation ActivateCreator($userId: ID!) {
        activateCreator(userId: $userId) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const SUSPEND_CREATOR_MUTATION = gql`
    mutation SuspendCreator($userId: ID!) {
        suspendCreator(userId: $userId) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const RESTORE_CREATOR_MUTATION = gql`
    mutation RestoreCreator($userId: ID!) {
        restoreCreator(userId: $userId) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const SET_CREATOR_STATUS_MUTATION = gql`
    mutation SetCreatorStatus(
        $userId: ID!
        $creatorStatus: String!
    ) {
        setCreatorStatus(
            userId: $userId
            creatorStatus: $creatorStatus
        ) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export const SET_PLATFORM_ROLE_MUTATION = gql`
    mutation SetPlatformRole(
        $userId: ID!
        $role: String!
    ) {
        setPlatformRole(
            userId: $userId
            role: $role
        ) {
            id
            email
            name
            image
            role
            creatorStatus
            createdAt
            updatedAt
        }
    }
`;

export type PlatformRole =
    | "listener"
    | "creator"
    | "admin"
    | "owner";

export type CreatorStatus =
    | "none"
    | "invited"
    | "active"
    | "suspended";

export type PlatformUser = {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: PlatformRole;
    creatorStatus: CreatorStatus;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type PlatformUsersData = {
    platformUsers: PlatformUser[];
};

export type PlatformUsersVariables = {
    role?: string | null;
    creatorStatus?: string | null;
    search?: string | null;
};

export type SetCreatorStatusData = {
    setCreatorStatus: PlatformUser;
};

export type SetCreatorStatusVariables = {
    userId: string;
    creatorStatus: CreatorStatus;
};

export type SetPlatformRoleData = {
    setPlatformRole: PlatformUser;
};

export type SetPlatformRoleVariables = {
    userId: string;
    role: PlatformRole;
};

export type CreatorLifecycleVariables = {
    userId: string;
};

export type InviteCreatorData = {
    inviteCreator: PlatformUser;
};

export type ActivateCreatorData = {
    activateCreator: PlatformUser;
};

export type SuspendCreatorData = {
    suspendCreator: PlatformUser;
};

export type RestoreCreatorData = {
    restoreCreator: PlatformUser;
};
