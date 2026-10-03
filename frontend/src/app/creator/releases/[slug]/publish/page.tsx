"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
    ARCHIVE_RELEASE_WORLD,
    CANCEL_SCHEDULED_RELEASE_WORLD,
    GET_RELEASE_PUBLISHING_READINESS,
    PUBLISH_RELEASE_WORLD,
    RESTORE_RELEASE_WORLD,
    SCHEDULE_RELEASE_WORLD,
    UNPUBLISH_RELEASE_WORLD,
    ArchiveReleaseWorldData,
    CancelScheduledReleaseWorldData,
    PublishReleaseWorldData,
    PublishReleaseWorldVariables,
    ReleasePublishingReadinessData,
    ReleasePublishingReadinessVariables,
    RestoreReleaseWorldData,
    ScheduleReleaseWorldVariables,
    ScheduledReleaseWorldData,
    UnpublishReleaseWorldData,
} from "@/graphql/onboarding";

const GET_RELEASE = gql`
    query ReleaseForPublishingReadiness($slug: String!) {
        getMyReleaseWorldBySlug(slug: $slug) {
            id
            title
            slug
            status
            visibility
            fullDropDate
            coverArtUrl
            oneLineSummary
            story
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
        fullDropDate?: string | null;
        coverArtUrl?: string | null;
        oneLineSummary?: string | null;
        story?: string | null;
    } | null;
};

const PREPARE_TRACKS = gql`
    query PrepareReleaseTracks($releaseWorldId: ID!) {
        getReleaseTracks(releaseWorldId: $releaseWorldId) {
            id title status visibility isPublic playbackStatus audioUrl previewAudioUrl realmId accessTier
        }
    }
`;
const MAKE_TRACK_PUBLIC = gql`
    mutation MakeIncludedTrackPublic($id: ID!, $input: UpdateReleaseTrackInput!) {
        updateReleaseTrack(id: $id, input: $input) { id visibility isPublic playbackStatus }
    }
`;
type PrepareTrack = {id:string; title:string; status:string; visibility:string; isPublic:boolean; playbackStatus:string; audioUrl?:string; previewAudioUrl?:string; realmId?:number|null; accessTier?:string};

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

    const tracksQuery = useQuery<{getReleaseTracks:PrepareTrack[]}>(PREPARE_TRACKS, {
        variables:{releaseWorldId:release?.id || ""}, skip:!release?.id, fetchPolicy:"cache-and-network",
    });
    const tracks = (tracksQuery.data?.getReleaseTracks ?? []).filter(track => track.status !== "archived");
    const [makeTrackPublic, makePublicState] = useMutation(MAKE_TRACK_PUBLIC);
    const [listenerMessage, setListenerMessage] = useState("");
    async function exposeTrack(track: PrepareTrack) {
        if (!window.confirm(`Make ${track.title} public with this release? Its existing playback and access settings will remain unchanged. This does not submit it to Nexus.`)) return;
        try {
            await makeTrackPublic({variables:{id:track.id,input:{visibility:"public"}}});
            await Promise.all([tracksQuery.refetch(),readinessQuery.refetch()]);
            setListenerMessage(`${track.title}: public visibility saved.`);
        } catch (e) { setListenerMessage(e instanceof Error ? e.message : "Could not save listener settings."); }
    }

    const readiness =
        readinessQuery.data?.getReleasePublishingReadiness;
    const activeError =
        releaseQuery.error || readinessQuery.error;

    const [publishRelease, publishState] = useMutation<
        PublishReleaseWorldData,
        PublishReleaseWorldVariables
    >(PUBLISH_RELEASE_WORLD);

    const [unpublishRelease, unpublishState] = useMutation<
        UnpublishReleaseWorldData,
        PublishReleaseWorldVariables
    >(UNPUBLISH_RELEASE_WORLD);

    const [archiveRelease, archiveState] = useMutation<
        ArchiveReleaseWorldData,
        PublishReleaseWorldVariables
    >(ARCHIVE_RELEASE_WORLD);

    const [restoreRelease, restoreState] = useMutation<
        RestoreReleaseWorldData,
        PublishReleaseWorldVariables
    >(RESTORE_RELEASE_WORLD);

    const [scheduleRelease, scheduleState] = useMutation<
        ScheduledReleaseWorldData,
        ScheduleReleaseWorldVariables
    >(SCHEDULE_RELEASE_WORLD);

    const [cancelSchedule, cancelScheduleState] = useMutation<
        CancelScheduledReleaseWorldData,
        PublishReleaseWorldVariables
    >(CANCEL_SCHEDULED_RELEASE_WORLD);

    const [publishAt, setPublishAt] = useState("");

    useEffect(() => {
        if (!release?.fullDropDate) return;

        const date = new Date(release.fullDropDate);
        if (Number.isNaN(date.getTime())) return;

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60_000
        );

        setPublishAt(localDate.toISOString().slice(0, 16));
    }, [release?.fullDropDate]);

    const mutating =
        makePublicState.loading ||
        publishState.loading ||
        unpublishState.loading ||
        archiveState.loading ||
        restoreState.loading ||
        scheduleState.loading ||
        cancelScheduleState.loading;

    async function handlePublish() {
        if (!release?.id || !readiness?.ready || mutating) {
            return;
        }

        const confirmed = window.confirm(
            `Publish ${release.title}? This will make the release, creator profile, and connected cover publicly available.`
        );

        if (!confirmed) return;

        try {
            await publishRelease({
                variables: {
                    releaseWorldId: release.id,
                },
            });

            await Promise.all([
                releaseQuery.refetch(),
                readinessQuery.refetch(),
            ]);
        } catch {
            // Apollo exposes the mutation error below.
        }
    }

    async function handleUnpublish() {
        if (!release?.id || mutating) {
            return;
        }

        const confirmed = window.confirm(
            `Unpublish ${release.title}? The release will return to a private draft, but no tracks, audio, artwork, or Creator OS work will be deleted.`
        );

        if (!confirmed) return;

        try {
            await unpublishRelease({
                variables: {
                    releaseWorldId: release.id,
                },
            });

            await Promise.all([
                releaseQuery.refetch(),
                readinessQuery.refetch(),
            ]);
        } catch {
            // Apollo exposes the mutation error below.
        }
    }

    async function handleArchive() {
        if (!release?.id || mutating) return;
        const confirmed = window.confirm(`Archive ${release.title}? All tracks, audio, artwork, and history will remain saved.`);
        if (!confirmed) return;
        try {
            await archiveRelease({ variables: { releaseWorldId: release.id } });
            await Promise.all([releaseQuery.refetch(), readinessQuery.refetch()]);
        } catch {}
    }

    async function handleRestore() {
        if (!release?.id || mutating) return;
        try {
            await restoreRelease({ variables: { releaseWorldId: release.id } });
            await Promise.all([releaseQuery.refetch(), readinessQuery.refetch()]);
        } catch {}
    }


    async function handleSchedule() {
        if (
            !release?.id ||
            !readiness?.ready ||
            !publishAt ||
            mutating
        ) {
            return;
        }

        const scheduledAt = new Date(publishAt);
        if (Number.isNaN(scheduledAt.getTime())) return;

        try {
            await scheduleRelease({
                variables: {
                    releaseWorldId: release.id,
                    publishAt: scheduledAt.toISOString(),
                },
            });

            await Promise.all([
                releaseQuery.refetch(),
                readinessQuery.refetch(),
            ]);
        } catch {}
    }

    async function handleCancelSchedule() {
        if (!release?.id || mutating) return;

        try {
            await cancelSchedule({
                variables: {
                    releaseWorldId: release.id,
                },
            });

            await Promise.all([
                releaseQuery.refetch(),
                readinessQuery.refetch(),
            ]);
        } catch {}
    }

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <nav className="flex flex-wrap items-center gap-x-5 gap-y-3" aria-label="Publishing review navigation">
                    <Link
                        href="/creator"
                        className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                    >
                        ← Creator OS
                    </Link>
                    <Link
                        href="/creator/projects"
                        className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                    >
                        All Projects
                    </Link>
                    <Link
                        href={`/releases/${slug}/board`}
                        className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                    >
                        Open Signal Board
                    </Link>
                    <Link
                        href={`/releases/${slug}`}
                        className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                    >
                        View Release Page
                    </Link>
                </nav>

                <section className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 sm:p-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                        Publishing Review
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                        {release?.title || "Release review"}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                        Review the release profile, artwork, tracks, playback,
                        dates, visibility, and Nexus configuration before you
                        publish, schedule, or update its public state.
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

                {release && <section className="mt-6 rounded-3xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold">Prepare your release</h2>
                    <p className="mt-2 text-sm text-white/60">Save your changes in the workspace, then review them here. Publishing and Nexus submission are separate.</p>
                    <ul className="mt-4 space-y-3">
                        <li>Artwork — {readiness?.completedChecks.includes("RELEASE_ARTWORK") ? "Added" : "Needs artwork"} · <Link href={`/releases/${slug}/board#assets`}>Artwork / Assets</Link></li>
                        <li>Audio — {tracks.length} included track(s) · <Link href={`/releases/${slug}/board#tracks`}>Review audio and playback</Link></li>
                        <li>Realm — {tracks.length && tracks.every(t=>t.realmId != null) ? "Assigned" : "Optional for release; choose before Nexus submission"} · <Link href={`/releases/${slug}/board#tracks`}>Review Realm</Link></li>
                        <li>One-line promise / story — {release.oneLineSummary?.trim() && release.story?.trim() ? "Added" : "Add your context"} · <Link href={`/releases/${slug}/board#portal`}>Edit release identity</Link></li>
                        <li>Release visibility — {release.visibility}. Use the publishing controls below when ready.</li>
                    </ul>
                    <h3 className="mt-5 font-semibold">Listener access</h3>
                    {tracksQuery.loading && <p>Checking saved track settings…</p>}
                    {tracksQuery.error && <p role="alert">{tracksQuery.error.message}</p>}
                    {tracks.map(track=><div key={track.id} className="mt-3">
                        <p>{track.title} · {track.visibility} · {track.playbackStatus} · {track.accessTier || "public"} access{!track.audioUrl && !track.previewAudioUrl ? " · Audio missing" : ""}</p>
                        {track.visibility === "private" && <button className="mt-2 rounded border border-white/30 px-3 py-2" disabled={mutating} onClick={()=>void exposeTrack(track)}>Make track public with release</button>}
                    </div>)}
                    <p role="status" className="mt-3">{listenerMessage}</p>
                    <Link href={`/releases/${slug}/board#tracks`}>Advanced listener settings in Tracks</Link>
                </section>}

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
                                This review uses the same guarded readiness
                                engine as the publishing controls below. Resolve
                                blockers before making the release public.
                            </p>
                        </section>

                        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                        Publication Controls
                                    </p>
                                    <h2 className="mt-3 text-xl font-semibold text-white">
                                        {release?.visibility === "public"
                                            ? "This release is currently public."
                                            : readiness.ready
                                              ? "This release can be published."
                                              : "Resolve blockers before publishing."}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-white/50">
                                        Publishing is guarded by the same
                                        readiness engine shown above. Warnings
                                        remain visible, but only blockers stop
                                        publication.
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    {release?.status === "archived" ? (
                                        <button type="button" onClick={() => void handleRestore()} disabled={mutating} className="rounded-full border border-sky-300/25 bg-sky-300/[0.07] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 disabled:opacity-40">
                                            {restoreState.loading ? "Restoring…" : "Restore release"}
                                        </button>
                                    ) : null}
                                    {release?.visibility === "public" ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleUnpublish()
                                            }
                                            disabled={mutating}
                                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {unpublishState.loading
                                                ? "Unpublishing…"
                                                : "Unpublish release"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handlePublish()
                                            }
                                            disabled={
                                                !readiness.ready ||
                                                mutating
                                            }
                                            className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                                        >
                                            {publishState.loading
                                                ? "Publishing…"
                                                : "Publish release"}
                                        </button>
                                    )}
                                    {release?.status !== "archived" ? (
                                        <button type="button" onClick={() => void handleArchive()} disabled={mutating} className="rounded-full border border-rose-300/20 bg-rose-300/[0.045] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-100/80 disabled:opacity-40">
                                            {archiveState.loading ? "Archiving…" : "Archive release"}
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {publishState.error ||
                            unpublishState.error ? (
                                <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/[0.055] p-4 text-sm text-rose-100">
                                    {(
                                        publishState.error ||
                                        unpublishState.error
                                    )?.message}
                                </div>
                            ) : null}

                            {publishState.data ? (
                                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.055] p-4 text-sm text-emerald-100">
                                    Release published successfully.
                                </div>
                            ) : null}

                            {unpublishState.data ? (
                                <div className="mt-5 rounded-2xl border border-sky-300/20 bg-sky-300/[0.055] p-4 text-sm text-sky-100">
                                    Release unpublished. Creator work was preserved.
                                </div>
                            ) : null}
                        </section>

                        {release?.visibility !== "public" &&
                        release?.status !== "archived" ? (
                            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                    Scheduled Publishing
                                </p>

                                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-white">
                                            Publication date and time
                                        </span>
                                        <input
                                            type="datetime-local"
                                            value={publishAt}
                                            onChange={(event) =>
                                                setPublishAt(
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#DCBA5C]/45"
                                        />
                                    </label>

                                    {release?.status === "scheduled" ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleCancelSchedule()
                                            }
                                            disabled={mutating}
                                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10 disabled:opacity-40"
                                        >
                                            {cancelScheduleState.loading
                                                ? "Cancelling…"
                                                : "Cancel schedule"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleSchedule()
                                            }
                                            disabled={
                                                !readiness.ready ||
                                                !publishAt ||
                                                mutating
                                            }
                                            className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                                        >
                                            {scheduleState.loading
                                                ? "Scheduling…"
                                                : "Schedule release"}
                                        </button>
                                    )}
                                </div>

                                <p className="mt-4 text-xs leading-5 text-white/35">
                                    Readiness is checked when the schedule is
                                    saved and again when publication becomes
                                    due. The release will only publish if its
                                    required configuration still passes review.
                                </p>

                                {release?.status === "scheduled" &&
                                release.fullDropDate ? (
                                    <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/[0.055] p-4 text-sm text-sky-100">
                                        Scheduled for{" "}
                                        {new Date(
                                            release.fullDropDate
                                        ).toLocaleString()}.
                                    </div>
                                ) : null}
                            </section>
                        ) : null}

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
