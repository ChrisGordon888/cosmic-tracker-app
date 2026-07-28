"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
    CreatorOnboardingReviewData,
    GET_CREATOR_ONBOARDING_REVIEW,
} from "@/graphql/onboarding";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";

const reviewSteps = [
    {
        id: "artist-profile",
        title: "Artist Identity",
        href: "/creator/onboarding/profile",
    },
    {
        id: "first-release",
        title: "Release World",
        href: "/creator/onboarding/release",
    },
    {
        id: "first-track",
        title: "First Track",
        href: "/creator/onboarding/track",
    },
    {
        id: "release-artwork",
        title: "Release Artwork",
        href: "/creator/onboarding/artwork",
    },
];

function formatValue(value?: string | number | null) {
    if (value === undefined || value === null || value === "") {
        return "Not provided";
    }

    return String(value);
}

export default function CreatorOnboardingReviewPage() {
    const {
        role,
        creatorStatus,
        canAccessCreatorOS,
    } = usePlatformAccess();

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery<CreatorOnboardingReviewData>(
        GET_CREATOR_ONBOARDING_REVIEW,
        {
            fetchPolicy: "cache-and-network",
        }
    );

    const progress = data?.getCreatorOnboardingProgress;
    const profile = data?.getCreatorOnboardingProfile;
    const release = data?.getCreatorOnboardingRelease;
    const track = data?.getCreatorOnboardingTrack;
    const artwork = data?.getCreatorOnboardingArtwork;

    const completed = new Set(progress?.completedSteps ?? []);
    const isComplete = Boolean(
        progress?.isReadyForActivation
    );
    const isInvitedCreator =
        role === "creator" &&
        creatorStatus === "invited";

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/creator/onboarding"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                >
                    ← Onboarding overview
                </Link>

                <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 sm:p-10">
                    <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                            Final Review
                        </p>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                            Your first creator world is assembled.
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
                            Review the identity, release, track, and artwork
                            Cosmic found in your creator-owned data. Nothing
                            here duplicates or republishes existing work.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-4">
                        {reviewSteps.map((step) => {
                            const complete = completed.has(step.id);

                            return (
                                <Link
                                    key={step.id}
                                    href={step.href}
                                    className={`rounded-2xl border p-4 transition ${
                                        complete
                                            ? "border-emerald-300/20 bg-emerald-300/[0.06] hover:bg-emerald-300/[0.1]"
                                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span
                                            className={`grid h-8 w-8 place-items-center rounded-xl border text-sm ${
                                                complete
                                                    ? "border-emerald-300/20 text-emerald-100"
                                                    : "border-white/10 text-white/35"
                                            }`}
                                        >
                                            {complete ? "✓" : "–"}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                                            Review
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-white">
                                        {step.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {loading && !data ? (
                    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Building readiness review…
                    </section>
                ) : null}

                {error ? (
                    <section className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-6">
                        <p className="font-medium text-rose-100">
                            The review could not be loaded.
                        </p>
                        <p className="mt-2 text-sm text-rose-100/65">
                            {error.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-4 rounded-full border border-rose-200/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-rose-100"
                        >
                            Try again
                        </button>
                    </section>
                ) : null}

                {data ? (
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <ReviewCard
                            eyebrow="Artist"
                            title={
                                profile?.displayName ||
                                profile?.artistName ||
                                "Artist identity"
                            }
                            href="/creator/onboarding/profile"
                        >
                            <Detail
                                label="Artist name"
                                value={profile?.artistName}
                            />
                            <Detail
                                label="Creator URL"
                                value={
                                    profile?.slug
                                        ? `/creators/${profile.slug}`
                                        : null
                                }
                            />
                            <Detail
                                label="Tagline"
                                value={profile?.tagline}
                            />
                            <Detail
                                label="Visibility"
                                value={
                                    profile?.isPublic
                                        ? "Public"
                                        : "Private"
                                }
                            />
                        </ReviewCard>

                        <ReviewCard
                            eyebrow="Release"
                            title={release?.title || "Release world"}
                            href="/creator/onboarding/release"
                        >
                            <Detail
                                label="Type"
                                value={release?.releaseType}
                            />
                            <Detail
                                label="Release URL"
                                value={
                                    release?.slug
                                        ? `/releases/${release.slug}`
                                        : null
                                }
                            />
                            <Detail
                                label="Status"
                                value={release?.status}
                            />
                            <Detail
                                label="Visibility"
                                value={release?.visibility}
                            />
                        </ReviewCard>

                        <ReviewCard
                            eyebrow="First Signal"
                            title={track?.title || "First track"}
                            href="/creator/onboarding/track"
                        >
                            <Detail
                                label="Track number"
                                value={track?.trackNumber}
                            />
                            <Detail
                                label="BPM"
                                value={track?.bpm}
                            />
                            <Detail
                                label="Key"
                                value={track?.keySignature}
                            />
                            <Detail
                                label="Playback"
                                value={track?.playbackStatus}
                            />
                        </ReviewCard>

                        <ReviewCard
                            eyebrow="Visual Anchor"
                            title={
                                artwork?.title || "Release artwork"
                            }
                            href="/creator/onboarding/artwork"
                        >
                            <div className="flex gap-4">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                                    {artwork?.url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={artwork.url}
                                            alt={
                                                artwork.title ||
                                                "Release artwork"
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center text-xl text-white/25">
                                            ✦
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <Detail
                                        label="File"
                                        value={
                                            artwork?.fileName ||
                                            artwork?.url
                                        }
                                    />
                                    <Detail
                                        label="Visibility"
                                        value={
                                            artwork?.isPublic
                                                ? "Public"
                                                : "Private"
                                        }
                                    />
                                </div>
                            </div>
                        </ReviewCard>
                    </div>
                ) : null}

                {data ? (
                    <section
                        className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${
                            isComplete
                                ? "border-emerald-300/20 bg-emerald-300/[0.055]"
                                : "border-amber-200/20 bg-amber-200/[0.045]"
                        }`}
                    >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <p
                                    className={`text-xs uppercase tracking-[0.2em] ${
                                        isComplete
                                            ? "text-emerald-100/75"
                                            : "text-amber-100/75"
                                    }`}
                                >
                                    {isComplete
                                        ? "Setup Complete"
                                        : "Setup Incomplete"}
                                </p>

                                <h2 className="mt-3 text-2xl font-semibold text-white">
                                    {canAccessCreatorOS
                                        ? "Creator OS is unlocked."
                                        : isInvitedCreator && isComplete
                                          ? "Your account is ready for activation."
                                          : "Complete the remaining onboarding steps."}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/55">
                                    {canAccessCreatorOS
                                        ? "Your current role already has full creator access. You can continue refining this work inside Creator OS."
                                        : isInvitedCreator && isComplete
                                          ? "An administrator or owner can now activate your creator account from the Authority Console. Your saved profile, release, track, and artwork will remain intact."
                                          : "Return to the incomplete step cards above. Readiness is calculated from the real work saved in the database."}
                                </p>

                                <p className="mt-3 text-xs text-white/35">
                                    Role: {role} · Creator status:{" "}
                                    {creatorStatus} · Onboarding status:{" "}
                                    {progress?.status || "unknown"}
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                                {canAccessCreatorOS ? (
                                    <Link
                                        href="/creator"
                                        className="inline-flex justify-center rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20"
                                    >
                                        Enter Creator OS
                                    </Link>
                                ) : null}

                                {(role === "owner" ||
                                    role === "admin") ? (
                                    <Link
                                        href="/admin"
                                        className="inline-flex justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10"
                                    >
                                        Open Authority Console
                                    </Link>
                                ) : null}

                                <Link
                                    href="/creator/onboarding"
                                    className="inline-flex justify-center rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/55 transition hover:bg-white/5 hover:text-white"
                                >
                                    Return to overview
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : null}
            </div>
        </main>
    );
}

function ReviewCard({
    eyebrow,
    title,
    href,
    children,
}: {
    eyebrow: string;
    title: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#DCBA5C]/65">
                        {eyebrow}
                    </p>
                    <h2 className="mt-2 text-xl font-medium text-white">
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="rounded-full border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/45 transition hover:bg-white/5 hover:text-white"
                >
                    Edit
                </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {children}
            </div>
        </article>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/15 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                {label}
            </p>
            <p className="mt-1 break-words text-sm capitalize text-white/70">
                {formatValue(value)}
            </p>
        </div>
    );
}
