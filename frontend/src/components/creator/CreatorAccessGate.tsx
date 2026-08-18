"use client";

import Link from "next/link";
import { useMutation } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";
import {
    BEGIN_CREATOR_ONBOARDING,
    type BeginCreatorOnboardingData,
} from "@/graphql/onboarding";

export default function CreatorAccessGate({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const {
        isAuthenticated,
        canAccessCreatorOS,
        canAccessCreatorOnboarding,
        loading,
        errorMessage,
        role,
        creatorStatus,
        refetch,
    } = usePlatformAccess();

    const [beginCreatorOnboarding, { loading: isStartingCreator, error: startCreatorError }] =
        useMutation<BeginCreatorOnboardingData>(BEGIN_CREATOR_ONBOARDING);

    const handleStartCreating = async () => {
        try {
            await beginCreatorOnboarding();
            await refetch();
            router.push("/creator/onboarding");
        } catch {
            // Apollo exposes the mutation error below the action button.
        }
    };

    const isOnboardingRoute =
        pathname === "/creator/onboarding" ||
        Boolean(pathname?.startsWith("/creator/onboarding/"));

    if (loading) {
        return (
            <main className="grid min-h-[65vh] place-items-center px-6">
                <section className="max-w-xl text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#DCBA5C]">
                        Creator OS
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">
                        Checking creator access…
                    </h1>
                </section>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="grid min-h-[65vh] place-items-center px-6">
                <section className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#DCBA5C]">
                        Sign In Required
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">
                        Creator OS is private.
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        Sign in with the account connected to your creator
                        workspace.
                    </p>
                    <Link
                        href="/auth?callbackUrl=/creator"
                        className="mt-6 inline-flex rounded-full bg-[#DCBA5C] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#080A10]"
                    >
                        Sign in to Cosmic
                    </Link>
                </section>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="grid min-h-[65vh] place-items-center px-6">
                <section className="max-w-xl rounded-3xl border border-red-400/20 bg-red-400/[0.05] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-red-200">
                        Access Check Failed
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">
                        We could not verify Creator OS access.
                    </h1>
                    <p className="mt-3 text-sm text-white/55">
                        {errorMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white"
                    >
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    if (
        isOnboardingRoute &&
        canAccessCreatorOnboarding
    ) {
        return <>{children}</>;
    }

    if (!canAccessCreatorOS) {
        const isInvitedCreator =
            role === "creator" &&
            creatorStatus === "invited";
        const canStartCreating =
            role === "listener" && creatorStatus === "none";

        return (
            <main className="grid min-h-[65vh] place-items-center px-6">
                <section className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7ED3FF]">
                        {isInvitedCreator
                            ? "Creator Invitation"
                            : "Creator Access Required"}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">
                        {isInvitedCreator
                            ? "Your creator workspace is waiting."
                            : "This account is not an active creator."}
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        Current role: <strong>{role}</strong>. Creator status:{" "}
                        <strong>{creatorStatus}</strong>.
                    </p>

                    {isInvitedCreator ? (
                        <>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                                Complete the guided setup to prepare your
                                first artist profile and release world.
                            </p>
                            <Link
                                href="/creator/onboarding"
                                className="mt-6 inline-flex rounded-full border border-[#DCBA5C]/35 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20"
                            >
                                Begin onboarding
                            </Link>
                        </>
                    ) : null}

                    {canStartCreating ? (
                        <>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                                Start a creator workspace and build your first
                                artist identity, release, track, and visual anchor.
                            </p>
                            <button
                                type="button"
                                onClick={() => void handleStartCreating()}
                                disabled={isStartingCreator}
                                className="mt-6 inline-flex rounded-full border border-[#DCBA5C]/35 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isStartingCreator ? "Starting…" : "Start Creating"}
                            </button>
                            {startCreatorError ? (
                                <p className="mt-3 text-sm text-rose-200">
                                    {startCreatorError.message}
                                </p>
                            ) : null}
                        </>
                    ) : null}
                </section>
            </main>
        );
    }

    return <>{children}</>;
}
