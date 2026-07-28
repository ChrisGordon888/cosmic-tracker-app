"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
    CreatorOnboardingProgressData,
    GET_CREATOR_ONBOARDING_PROGRESS,
} from "@/graphql/onboarding";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";

const steps = [
    {
        id: "artist-profile",
        title: "Artist identity",
        description:
            "Create the name, public identity, and foundation for your creator world.",
        href: "/creator/onboarding/profile",
    },
    {
        id: "first-release",
        title: "First release world",
        description:
            "Give the project a title, story, type, and public-facing destination.",
        href: "/creator/onboarding/release",
    },
    {
        id: "first-track",
        title: "First track",
        description:
            "Add the first musical signal that belongs inside this release.",
        href: "/creator/onboarding/track",
    },
    {
        id: "release-artwork",
        title: "Release artwork",
        description:
            "Add a visual anchor so the release feels recognizable and complete.",
        href: "/creator/onboarding/artwork",
    },
];

function statusLabel(status?: string) {
    switch (status) {
        case "in-progress":
            return "In progress";
        case "ready":
            return "Ready for activation";
        case "complete":
            return "Complete";
        default:
            return "Not started";
    }
}

export default function CreatorOnboardingPage() {
    const {
        role,
        creatorStatus,
    } = usePlatformAccess();

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<CreatorOnboardingProgressData>(
        GET_CREATOR_ONBOARDING_PROGRESS,
        {
            fetchPolicy: "cache-and-network",
        }
    );

    const progress = data?.getCreatorOnboardingProgress;
    const completed = new Set(progress?.completedSteps ?? []);
    const percentage = progress
        ? Math.round(
              (progress.completedCount / progress.totalSteps) * 100
          )
        : 0;

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 shadow-2xl shadow-black/30 sm:p-10">
                    <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                            Creator Onboarding
                        </p>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                            Build your first world.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                            Cosmic will guide you from invitation to a usable
                            artist identity, first release, first track, and
                            visual anchor. Each completed step is measured from
                            the work actually saved in your Creator OS.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div>
                            <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-white/40">
                                <span>
                                    {progress
                                        ? `${progress.completedCount} of ${progress.totalSteps} complete`
                                        : "Checking progress"}
                                </span>
                                <span>{percentage}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-[#DCBA5C] transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                                Status
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#F4D982]">
                                {statusLabel(progress?.status)}
                            </p>
                        </div>
                    </div>
                </section>

                {loading && !progress ? (
                    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Reading your creator setup…
                    </section>
                ) : null}

                {error ? (
                    <section className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-6">
                        <p className="font-medium text-rose-100">
                            We could not load onboarding progress.
                        </p>
                        <p className="mt-2 text-sm text-rose-100/65">
                            {error.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-4 rounded-full border border-rose-200/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-rose-100"
                        >
                            Try again
                        </button>
                    </section>
                ) : null}

                <section className="mt-6 grid gap-4">
                    {steps.map((step, index) => {
                        const isComplete = completed.has(step.id);
                        const isNext =
                            progress?.nextStepId === step.id;
                        const isAvailable =
                            isComplete ||
                            isNext ||
                            progress?.status === "complete";

                        return (
                            <article
                                key={step.id}
                                className={`rounded-3xl border p-5 sm:p-6 ${
                                    isNext
                                        ? "border-[#DCBA5C]/35 bg-[#DCBA5C]/[0.06]"
                                        : "border-white/10 bg-white/[0.03]"
                                }`}
                            >
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-4">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${
                                                isComplete
                                                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                                                    : isNext
                                                      ? "border-[#DCBA5C]/30 bg-[#DCBA5C]/10 text-[#F4D982]"
                                                      : "border-white/10 bg-white/5 text-white/35"
                                            }`}
                                        >
                                            {isComplete ? "✓" : index + 1}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-medium text-white">
                                                    {step.title}
                                                </h2>
                                                {isNext ? (
                                                    <span className="rounded-full border border-[#DCBA5C]/25 bg-[#DCBA5C]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#F4D982]">
                                                        Next
                                                    </span>
                                                ) : null}
                                                {isComplete ? (
                                                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">
                                                        Complete
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {isAvailable ? (
                                        <Link
                                            href={step.href}
                                            className="inline-flex shrink-0 justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/75 transition hover:border-[#DCBA5C]/30 hover:bg-[#DCBA5C]/10 hover:text-[#F4D982]"
                                        >
                                            {isComplete
                                                ? "Review"
                                                : "Continue"}
                                        </Link>
                                    ) : (
                                        <span className="shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-white/25">
                                            Locked
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>

                {progress?.isReadyForActivation ? (
                    <section className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.055] p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">
                                    All steps complete
                                </p>
                                <h2 className="mt-2 text-xl font-medium text-white">
                                    Review your creator world.
                                </h2>
                                <p className="mt-2 text-sm text-white/50">
                                    Confirm the profile, release, first track,
                                    and artwork before activation.
                                </p>
                            </div>

                            <Link
                                href="/creator/onboarding/review"
                                className="inline-flex shrink-0 justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-300/15"
                            >
                                Open final review
                            </Link>
                        </div>
                    </section>
                ) : null}

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Account state
                            </p>
                            <p className="mt-2 text-sm text-white/60">
                                Role: <strong>{role}</strong> · Creator
                                status: <strong>{creatorStatus}</strong>
                            </p>
                        </div>

                        {progress?.isReadyForActivation &&
                        creatorStatus === "invited" ? (
                            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-100">
                                Setup complete. Your account is ready for
                                activation.
                            </div>
                        ) : null}

                        {creatorStatus === "active" ? (
                            <Link
                                href="/creator"
                                className="inline-flex justify-center rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982]"
                            >
                                Enter Creator OS
                            </Link>
                        ) : null}
                    </div>
                </section>
            </div>
        </main>
    );
}
