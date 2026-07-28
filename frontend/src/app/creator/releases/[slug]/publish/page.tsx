"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import {
    GET_RELEASE_PUBLISHING_READINESS,
    ReleasePublishingReadinessData,
    ReleasePublishingReadinessVariables,
} from "@/graphql/onboarding";

const GET_RELEASE = gql`
    query ReleaseForPublishingReadiness($slug: String!) {
        getMyReleaseWorldBySlug(slug: $slug) {
            id
            title
            slug
            status
            visibility
        }
    }
`;

type ReleaseData = {
    getMyReleaseWorldBySlug?: {
        id: string;
        title: string;
        slug: string;
        status: string;
        visibility: string;
    } | null;
};

export default function PublishingReadinessPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug || "";

    const releaseQuery = useQuery<ReleaseData>(GET_RELEASE, {
        variables: { slug },
        skip: !slug,
        fetchPolicy: "cache-and-network",
    });

    const release = releaseQuery.data?.getMyReleaseWorldBySlug;

    const readinessQuery = useQuery<
        ReleasePublishingReadinessData,
        ReleasePublishingReadinessVariables
    >(GET_RELEASE_PUBLISHING_READINESS, {
        variables: { releaseWorldId: release?.id || "" },
        skip: !release?.id,
        fetchPolicy: "cache-and-network",
    });

    const readiness =
        readinessQuery.data?.getReleasePublishingReadiness;
    const activeError =
        releaseQuery.error || readinessQuery.error;

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/creator"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                >
                    ← Creator OS
                </Link>

                <section className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 sm:p-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                        Publishing Readiness
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                        {release?.title || "Release review"}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                        Cosmic is inspecting the real profile, release,
                        artwork, tracks, playback states, dates, visibility,
                        and Nexus configuration. Nothing is changed here.
                    </p>
                </section>

                {(releaseQuery.loading || readinessQuery.loading) &&
                !readiness ? (
                    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Evaluating release readiness…
                    </section>
                ) : null}

                {activeError ? (
                    <section className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-6 text-sm text-rose-100">
                        {activeError.message}
                    </section>
                ) : null}

                {readiness ? (
                    <>
                        <section className="mt-6 grid gap-4 sm:grid-cols-4">
                            <Metric label="Score" value={`${readiness.score}%`} />
                            <Metric label="Tracks" value={String(readiness.trackCount)} />
                            <Metric
                                label="Blockers"
                                value={String(readiness.blockingIssues.length)}
                            />
                            <Metric
                                label="Warnings"
                                value={String(readiness.warnings.length)}
                            />
                        </section>

                        <section
                            className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${
                                readiness.ready
                                    ? "border-emerald-300/20 bg-emerald-300/[0.055]"
                                    : "border-amber-200/20 bg-amber-200/[0.045]"
                            }`}
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                                {readiness.ready
                                    ? "Ready for publishing controls"
                                    : "Publishing blocked"}
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                {readiness.ready
                                    ? "No blocking configuration issues were found."
                                    : `${readiness.blockingIssues.length} blocking issue${
                                          readiness.blockingIssues.length === 1
                                              ? ""
                                              : "s"
                                      } found.`}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                                V5A is diagnostic only. The guarded publish
                                action comes after this engine is proven
                                against real releases.
                            </p>
                        </section>

                        <Issues
                            title="Blocking issues"
                            issues={readiness.blockingIssues}
                            empty="No blockers detected."
                        />
                        <Issues
                            title="Warnings"
                            issues={readiness.warnings}
                            empty="No warnings detected."
                        />

                        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Completed checks
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {readiness.completedChecks.map((check) => (
                                    <span
                                        key={check}
                                        className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 text-xs text-emerald-100/80"
                                    >
                                        ✓ {check}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
                {value}
            </p>
        </div>
    );
}

function Issues({
    title,
    issues,
    empty,
}: {
    title: string;
    issues: Array<{
        code: string;
        message: string;
        field?: string | null;
        href?: string | null;
    }>;
    empty: string;
}) {
    return (
        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                {title}
            </p>
            {issues.length === 0 ? (
                <p className="mt-4 text-sm text-white/50">{empty}</p>
            ) : (
                <div className="mt-4 space-y-3">
                    {issues.map((issue, index) => (
                        <article
                            key={`${issue.code}-${index}`}
                            className="rounded-2xl border border-white/10 bg-black/15 p-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                                        {issue.code}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/75">
                                        {issue.message}
                                    </p>
                                    {issue.field ? (
                                        <p className="mt-2 text-xs text-white/30">
                                            Field: {issue.field}
                                        </p>
                                    ) : null}
                                </div>
                                {issue.href ? (
                                    <Link
                                        href={issue.href}
                                        className="inline-flex shrink-0 justify-center rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white/55 hover:bg-white/5"
                                    >
                                        Resolve
                                    </Link>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
