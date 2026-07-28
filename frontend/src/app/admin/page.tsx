"use client";

import {
    CREATOR_STATUS_OPTIONS,
    PLATFORM_ROLE_OPTIONS,
} from "./support/options";
import {
    ACTIVATE_CREATOR_MUTATION,
    ActivateCreatorData,
    CreatorLifecycleVariables,
    CreatorStatus,
    INVITE_CREATOR_MUTATION,
    InviteCreatorData,
    PlatformRole,
    PlatformUser,
    PlatformUsersData,
    PlatformUsersVariables,
    RESTORE_CREATOR_MUTATION,
    RestoreCreatorData,
    SET_PLATFORM_ROLE_MUTATION,
    SUSPEND_CREATOR_MUTATION,
    SuspendCreatorData,
    SetPlatformRoleData,
    SetPlatformRoleVariables,
    PLATFORM_USERS_QUERY,
} from "@/graphql/admin";
import { useMutation, useQuery } from "@apollo/client";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";
import Image from "next/image";
import { useMemo, useState } from "react";


function formatDate(value?: string | null) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function getInitials(user: PlatformUser) {
    const source = user.name?.trim() || user.email;
    const words = source.split(/\s+/).filter(Boolean);

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}

function roleLabel(role: PlatformRole) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function statusLabel(status: CreatorStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function roleBadgeClass(role: PlatformRole) {
    switch (role) {
        case "owner":
            return "border-[#DCBA5C]/30 bg-[#DCBA5C]/10 text-[#F4D982]";
        case "admin":
            return "border-violet-300/25 bg-violet-300/10 text-violet-100";
        case "creator":
            return "border-sky-300/25 bg-sky-300/10 text-sky-100";
        default:
            return "border-white/10 bg-white/5 text-white/60";
    }
}

function statusBadgeClass(status: CreatorStatus) {
    switch (status) {
        case "active":
            return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
        case "invited":
            return "border-amber-200/25 bg-amber-200/10 text-amber-100";
        case "suspended":
            return "border-rose-300/25 bg-rose-300/10 text-rose-100";
        default:
            return "border-white/10 bg-white/5 text-white/50";
    }
}

export default function AdminPage() {
    const {
        canAccessOwnerTools,
        canManageCreatorStatuses,
    } = usePlatformAccess();

    const isOwner = canAccessOwnerTools;

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [workingUserId, setWorkingUserId] = useState<string | null>(
        null
    );

    const variables = useMemo<PlatformUsersVariables>(
        () => ({
            search: search || null,
            role: roleFilter || null,
            creatorStatus: statusFilter || null,
        }),
        [search, roleFilter, statusFilter]
    );

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<PlatformUsersData, PlatformUsersVariables>(
        PLATFORM_USERS_QUERY,
        {
            variables,
            fetchPolicy: "cache-and-network",
            notifyOnNetworkStatusChange: true,
        }
    );

    const [inviteCreator] = useMutation<
        InviteCreatorData,
        CreatorLifecycleVariables
    >(INVITE_CREATOR_MUTATION);

    const [activateCreator] = useMutation<
        ActivateCreatorData,
        CreatorLifecycleVariables
    >(ACTIVATE_CREATOR_MUTATION);

    const [suspendCreator] = useMutation<
        SuspendCreatorData,
        CreatorLifecycleVariables
    >(SUSPEND_CREATOR_MUTATION);

    const [restoreCreator] = useMutation<
        RestoreCreatorData,
        CreatorLifecycleVariables
    >(RESTORE_CREATOR_MUTATION);

    const [setPlatformRole] = useMutation<
        SetPlatformRoleData,
        SetPlatformRoleVariables
    >(SET_PLATFORM_ROLE_MUTATION);

    const users = data?.platformUsers ?? [];

    async function handleCreatorLifecycle(
        user: PlatformUser,
        action: "invite" | "activate" | "suspend" | "restore"
    ) {
        setFeedback(null);
        setWorkingUserId(user.id);

        try {
            if (action === "invite") {
                await inviteCreator({ variables: { userId: user.id } });
            } else if (action === "activate") {
                await activateCreator({ variables: { userId: user.id } });
            } else if (action === "suspend") {
                await suspendCreator({ variables: { userId: user.id } });
            } else {
                await restoreCreator({ variables: { userId: user.id } });
            }

            await refetch();

            const actionMessage = {
                invite: "invited as a creator",
                activate: "activated",
                suspend: "suspended",
                restore: "restored",
            }[action];

            setFeedback({
                type: "success",
                message: `${user.name || user.email} was ${actionMessage}.`,
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Creator lifecycle update failed.",
            });
        } finally {
            setWorkingUserId(null);
        }
    }

    async function handleRole(
        user: PlatformUser,
        role: PlatformRole
    ) {
        if (!isOwner || role === user.role) return;

        const confirmed = window.confirm(
            `Change ${user.name || user.email} from ${roleLabel(
                user.role
            )} to ${roleLabel(role)}?`
        );

        if (!confirmed) return;

        setFeedback(null);
        setWorkingUserId(user.id);

        try {
            await setPlatformRole({
                variables: {
                    userId: user.id,
                    role,
                },
            });

            await refetch();

            setFeedback({
                type: "success",
                message: `${user.name || user.email} now has the ${roleLabel(
                    role
                )} role.`,
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Platform role update failed.",
            });
        } finally {
            setWorkingUserId(null);
        }
    }

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearch(searchInput.trim());
    }

    function clearFilters() {
        setSearchInput("");
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
        setFeedback(null);
    }

    return (
        <main className="px-4 py-8 sm:py-10">
            <div className="mx-auto max-w-7xl">
                <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs uppercase tracking-[0.22em] text-[#DCBA5C]/75">
                                Patch 4.1
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Platform users
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">
                                Invite and activate creators, suspend access safely,
                                and manage platform authority without touching a
                                creator&apos;s owned work.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Metric
                                label="Visible users"
                                value={String(users.length)}
                            />
                            <Metric
                                label="Active creators"
                                value={String(
                                    users.filter(
                                        (user) =>
                                            user.role === "creator" &&
                                            user.creatorStatus === "active"
                                    ).length
                                )}
                            />
                            <Metric
                                label="Invited"
                                value={String(
                                    users.filter(
                                        (user) =>
                                            user.creatorStatus === "invited"
                                    ).length
                                )}
                                className="col-span-2 sm:col-span-1"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    <form
                        onSubmit={submitSearch}
                        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
                    >
                        <label className="block">
                            <span className="sr-only">Search users</span>
                            <input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Search name or email"
                                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#DCBA5C]/45"
                            />
                        </label>

                        <label>
                            <span className="sr-only">Filter by role</span>
                            <select
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-white/10 bg-[#0A0E17] px-3 text-sm text-white/80 outline-none focus:border-[#DCBA5C]/45"
                            >
                                <option value="">All roles</option>
                                {PLATFORM_ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabel(role)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="sr-only">
                                Filter by creator status
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-white/10 bg-[#0A0E17] px-3 text-sm text-white/80 outline-none focus:border-[#DCBA5C]/45"
                            >
                                <option value="">All statuses</option>
                                {CREATOR_STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {statusLabel(status)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="h-11 flex-1 rounded-xl border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-4 text-sm font-medium text-[#F4D982] transition hover:bg-[#DCBA5C]/20"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                {feedback ? (
                    <div
                        className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                            feedback.type === "success"
                                ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100"
                                : "border-rose-300/20 bg-rose-300/[0.07] text-rose-100"
                        }`}
                    >
                        {feedback.message}
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-5 text-sm text-rose-100">
                        <p className="font-medium">
                            The authority console could not load.
                        </p>
                        <p className="mt-2 text-rose-100/70">
                            {error.message}
                        </p>
                    </div>
                ) : null}

                <section className="mt-6">
                    {loading && users.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/50">
                            Loading platform users…
                        </div>
                    ) : null}

                    {!loading && !error && users.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                            <p className="text-lg font-medium text-white">
                                No users found
                            </p>
                            <p className="mt-2 text-sm text-white/45">
                                Change the search or filters and try again.
                            </p>
                        </div>
                    ) : null}

                    <div className="grid gap-4">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                isOwner={isOwner}
                                isWorking={workingUserId === user.id}
                                onCreatorLifecycle={handleCreatorLifecycle}
                                onRole={handleRole}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function Metric({
    label,
    value,
    className = "",
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div
            className={`min-w-[120px] rounded-2xl border border-white/10 bg-black/15 px-4 py-3 ${className}`}
        >
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
                {label}
            </p>
        </div>
    );
}

function UserCard({
    user,
    isOwner,
    isWorking,
    onCreatorLifecycle,
    onRole,
}: {
    user: PlatformUser;
    isOwner: boolean;
    isWorking: boolean;
    onCreatorLifecycle: (
        user: PlatformUser,
        action: "invite" | "activate" | "suspend" | "restore"
    ) => Promise<void>;
    onRole: (
        user: PlatformUser,
        role: PlatformRole
    ) => Promise<void>;
}) {
    const canManageCreatorStatus =
        user.role !== "owner" || isOwner;

    return (
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        ) : (
                            getInitials(user)
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-medium text-white">
                                {user.name || "Unnamed user"}
                            </h3>
                            <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${roleBadgeClass(
                                    user.role
                                )}`}
                            >
                                {roleLabel(user.role)}
                            </span>
                            <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${statusBadgeClass(
                                    user.creatorStatus
                                )}`}
                            >
                                {statusLabel(user.creatorStatus)}
                            </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-white/50">
                            {user.email}
                        </p>
                        <p className="mt-1 text-xs text-white/30">
                            Joined {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap gap-2">
                        {user.role === "creator" &&
                        user.creatorStatus !== "active" ? (
                            <ActionButton
                                label="Activate"
                                disabled={
                                    isWorking ||
                                    !canManageCreatorStatus
                                }
                                onClick={() =>
                                    onCreatorLifecycle(user, "activate")
                                }
                            />
                        ) : null}

                        {user.role === "creator" &&
                        user.creatorStatus === "active" ? (
                            <ActionButton
                                label="Suspend"
                                variant="danger"
                                disabled={
                                    isWorking ||
                                    !canManageCreatorStatus
                                }
                                onClick={() =>
                                    onCreatorLifecycle(user, "suspend")
                                }
                            />
                        ) : null}

                        {user.role === "creator" &&
                        user.creatorStatus === "suspended" ? (
                            <ActionButton
                                label="Restore"
                                disabled={
                                    isWorking ||
                                    !canManageCreatorStatus
                                }
                                onClick={() =>
                                    onCreatorLifecycle(user, "restore")
                                }
                            />
                        ) : null}

                        {user.role === "listener" ? (
                            <ActionButton
                                label="Invite as creator"
                                disabled={isWorking}
                                onClick={() =>
                                    onCreatorLifecycle(user, "invite")
                                }
                            />
                        ) : null}
                    </div>

                    {isOwner ? (
                        <label className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                                Role
                            </span>
                            <select
                                value={user.role}
                                disabled={isWorking}
                                onChange={(event) =>
                                    onRole(
                                        user,
                                        event.target.value as PlatformRole
                                    )
                                }
                                className="h-10 rounded-xl border border-white/10 bg-[#0A0E17] px-3 text-sm text-white/75 outline-none transition focus:border-[#DCBA5C]/45 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {PLATFORM_ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabel(role)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}

                    {isWorking ? (
                        <span className="text-xs text-[#F4D982]/70">
                            Updating…
                        </span>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function ActionButton({
    label,
    onClick,
    disabled,
    variant = "default",
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "danger";
}) {
    const className =
        variant === "danger"
            ? "border-rose-300/20 bg-rose-300/[0.07] text-rose-100 hover:bg-rose-300/[0.12]"
            : "border-[#DCBA5C]/25 bg-[#DCBA5C]/10 text-[#F4D982] hover:bg-[#DCBA5C]/18";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
        >
            {label}
        </button>
    );
}
