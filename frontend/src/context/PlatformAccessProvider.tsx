"use client";

import {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { GET_ME } from "@/graphql/realms";

export type PlatformRole = "listener" | "creator" | "admin" | "owner";
export type CreatorStatus = "none" | "invited" | "active" | "suspended";

export interface PlatformUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: PlatformRole;
    creatorStatus: CreatorStatus;
}

interface PlatformAccessContextValue {
    user: PlatformUser | null;
    role: PlatformRole;
    creatorStatus: CreatorStatus;
    isAuthenticated: boolean;
    isListener: boolean;
    isCreator: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    canAccessCreatorOS: boolean;
    canAccessCreatorOnboarding: boolean;
    canReviewUnreleased: boolean;
    canAccessAdmin: boolean;
    canAccessOwnerTools: boolean;
    canManageCreatorStatuses: boolean;
    canManagePlatformRoles: boolean;
    canManageOwnContent: boolean;
    loading: boolean;
    errorMessage: string | null;
    refetch: () => Promise<unknown>;
}

const PlatformAccessContext = createContext<PlatformAccessContextValue | null>(null);

export function PlatformAccessProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    const { data, loading: queryLoading, error, refetch } = useQuery(GET_ME, {
        skip: !isAuthenticated,
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });

    const user = (data?.me ?? null) as PlatformUser | null;
    const role: PlatformRole = user?.role ?? "listener";
    const creatorStatus: CreatorStatus = user?.creatorStatus ?? "none";

    const value = useMemo<PlatformAccessContextValue>(() => {
        const isOwner = role === "owner";
        const isAdmin = role === "admin" || isOwner;
        const isCreator = role === "creator" && creatorStatus === "active";
        const canAccessCreatorOS = isOwner || isAdmin || isCreator;
        const canAccessCreatorOnboarding =
            isOwner ||
            isAdmin ||
            (role === "creator" &&
                ["invited", "active"].includes(creatorStatus));

        return {
            user, role, creatorStatus, isAuthenticated,
            isListener: role === "listener",
            isCreator, isAdmin, isOwner,
            canAccessCreatorOS,
            canAccessCreatorOnboarding,
            canReviewUnreleased: canAccessCreatorOS,
            canAccessAdmin: isAdmin,
            canAccessOwnerTools: isOwner,
            canManageCreatorStatuses: isAdmin,
            canManagePlatformRoles: isOwner,
            canManageOwnContent: canAccessCreatorOS,
            loading: status === "loading" || (isAuthenticated && queryLoading),
            errorMessage: error?.message ?? null,
            refetch,
        };
    }, [creatorStatus, error?.message, isAuthenticated, queryLoading, refetch, role, status, user]);

    return <PlatformAccessContext.Provider value={value}>{children}</PlatformAccessContext.Provider>;
}

export function usePlatformAccess() {
    const context = useContext(PlatformAccessContext);
    if (!context) {
        throw new Error("usePlatformAccess must be used inside PlatformAccessProvider");
    }
    return context;
}
