"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
    CreatorOnboardingTrackData,
    GET_CREATOR_ONBOARDING_PROGRESS,
    GET_CREATOR_ONBOARDING_TRACK,
    SAVE_CREATOR_ONBOARDING_TRACK,
    SaveCreatorOnboardingTrackData,
    SaveCreatorOnboardingTrackVariables,
} from "@/graphql/onboarding";

const TRACK_ROLES = [
    { value: "single", label: "Single / Focus Track" },
    { value: "intro", label: "Intro" },
    { value: "interlude", label: "Interlude" },
    { value: "outro", label: "Outro" },
    { value: "bonus", label: "Bonus Track" },
];

function createSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export default function CreatorOnboardingTrackPage() {
    const { data, loading, error } =
        useQuery<CreatorOnboardingTrackData>(
            GET_CREATOR_ONBOARDING_TRACK,
            { fetchPolicy: "cache-and-network" }
        );

    const [saveTrack, { loading: saving }] = useMutation<
        SaveCreatorOnboardingTrackData,
        SaveCreatorOnboardingTrackVariables
    >(SAVE_CREATOR_ONBOARDING_TRACK);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [role, setRole] = useState("single");
    const [bpm, setBpm] = useState("");
    const [keySignature, setKeySignature] = useState("");
    const [mood, setMood] = useState("");
    const [hook, setHook] = useState("");
    const [notes, setNotes] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const track = data?.getCreatorOnboardingTrack;

    useEffect(() => {
        if (!track) return;

        setTitle(track.title || "");
        setSlug(track.slug || "");
        setRole(track.role || "single");
        setBpm(
            track.bpm === null || track.bpm === undefined
                ? ""
                : String(track.bpm)
        );
        setKeySignature(track.keySignature || "");
        setMood(track.mood || "");
        setHook(track.hook || "");
        setNotes(track.notes || "");
        setSlugTouched(true);
    }, [track]);

    useEffect(() => {
        if (!slugTouched) {
            setSlug(createSlug(title));
        }
    }, [title, slugTouched]);

    const parsedBpm = bpm.trim() ? Number(bpm) : null;

    const canSubmit = useMemo(
        () =>
            title.trim().length > 0 &&
            slug.trim().length > 0 &&
            (parsedBpm === null ||
                (Number.isFinite(parsedBpm) &&
                    parsedBpm >= 1 &&
                    parsedBpm <= 300)) &&
            !saving,
        [title, slug, parsedBpm, saving]
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setFeedback(null);

        try {
            await saveTrack({
                variables: {
                    input: {
                        title: title.trim(),
                        slug: createSlug(slug),
                        role,
                        bpm: parsedBpm,
                        keySignature: keySignature.trim(),
                        mood: mood.trim(),
                        hook: hook.trim(),
                        notes: notes.trim(),
                    },
                },
                refetchQueries: [
                    { query: GET_CREATOR_ONBOARDING_TRACK },
                    { query: GET_CREATOR_ONBOARDING_PROGRESS },
                ],
                awaitRefetchQueries: true,
            });

            setSlug(createSlug(slug));
            setFeedback({
                type: "success",
                message:
                    "First track saved. Your existing publication settings were preserved.",
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Track could not be saved.",
            });
        }
    }

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/creator/onboarding"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                >
                    ← Onboarding overview
                </Link>

                <section className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 sm:p-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                        Step 3 of 4
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        Shape the first musical signal.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                        This page uses the first track already connected to
                        your release when one exists. It does not create a
                        duplicate or reset the track&apos;s public, playback,
                        or Nexus settings.
                    </p>
                </section>

                {loading && !track ? (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Loading first track…
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-5 text-sm text-rose-100">
                        {error.message}
                    </div>
                ) : null}

                {track ? (
                    <div className="mt-6 grid gap-3 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.045] p-5 sm:grid-cols-3">
                        <State label="Current status" value={track.status} />
                        <State label="Visibility" value={track.visibility} />
                        <State
                            label="Playback"
                            value={track.playbackStatus}
                        />
                    </div>
                ) : null}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Track title"
                            help="The first song or signal inside this release."
                        >
                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={120}
                                placeholder="Track title"
                                className="form-input"
                                required
                            />
                        </Field>

                        <Field
                            label="Track role"
                            help="How this song functions inside the release."
                        >
                            <select
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                className="form-input"
                            >
                                {TRACK_ROLES.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field
                        label="Track URL"
                        help="This becomes the track identifier inside the release."
                    >
                        <input
                            value={slug}
                            onChange={(event) => {
                                setSlugTouched(true);
                                setSlug(createSlug(event.target.value));
                            }}
                            maxLength={80}
                            placeholder="track-title"
                            className="form-input"
                            required
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Field label="BPM">
                            <input
                                type="number"
                                min={1}
                                max={300}
                                value={bpm}
                                onChange={(event) =>
                                    setBpm(event.target.value)
                                }
                                placeholder="143"
                                className="form-input"
                            />
                        </Field>

                        <Field label="Key">
                            <input
                                value={keySignature}
                                onChange={(event) =>
                                    setKeySignature(event.target.value)
                                }
                                maxLength={40}
                                placeholder="C major"
                                className="form-input"
                            />
                        </Field>

                        <Field label="Mood">
                            <input
                                value={mood}
                                onChange={(event) =>
                                    setMood(event.target.value)
                                }
                                maxLength={120}
                                placeholder="Euphoric, reflective"
                                className="form-input"
                            />
                        </Field>
                    </div>

                    <Field
                        label="Hook or central idea"
                        help="Capture the lyrical, melodic, or emotional center."
                    >
                        <textarea
                            value={hook}
                            onChange={(event) =>
                                setHook(event.target.value)
                            }
                            rows={4}
                            maxLength={1000}
                            placeholder="What makes this track unforgettable?"
                            className="form-input resize-y"
                        />
                    </Field>

                    <Field
                        label="Creative notes"
                        help="Production, writing, arrangement, or intention notes."
                    >
                        <textarea
                            value={notes}
                            onChange={(event) =>
                                setNotes(event.target.value)
                            }
                            rows={6}
                            maxLength={2500}
                            placeholder="Describe the direction of the track…"
                            className="form-input resize-y"
                        />
                    </Field>

                    <div className="rounded-2xl border border-[#7ED3FF]/15 bg-[#7ED3FF]/[0.04] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A8E2FF]">
                            Existing work is protected
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                            When a track already exists, onboarding preserves
                            its status, visibility, playback state, audio,
                            Nexus placement, and public settings. New tracks
                            begin as private, locked drafts.
                        </p>
                    </div>

                    {feedback ? (
                        <div
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                                feedback.type === "success"
                                    ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100"
                                    : "border-rose-300/20 bg-rose-300/[0.07] text-rose-100"
                            }`}
                        >
                            {feedback.message}
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-white/35">
                            This step edits the first track connected to the
                            onboarding release.
                        </p>

                        <div className="flex gap-3">
                            {track ? (
                                <Link
                                    href="/creator/onboarding/artwork"
                                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10"
                                >
                                    Next step
                                </Link>
                            ) : null}

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                {saving
                                    ? "Saving…"
                                    : track
                                      ? "Save changes"
                                      : "Create first track"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                :global(.form-input) {
                    width: 100%;
                    border-radius: 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.75rem 0.9rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                }

                :global(.form-input::placeholder) {
                    color: rgba(255, 255, 255, 0.25);
                }

                :global(.form-input:focus) {
                    border-color: rgba(220, 186, 92, 0.45);
                }

                :global(.form-input option) {
                    background: #0a0e17;
                    color: white;
                }
            `}</style>
        </main>
    );
}

function Field({
    label,
    help,
    children,
}: {
    label: string;
    help?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-white">
                {label}
            </span>
            {help ? (
                <span className="mb-2 mt-1 block text-xs leading-5 text-white/40">
                    {help}
                </span>
            ) : null}
            {children}
        </label>
    );
}

function State({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-emerald-100">
                {value}
            </p>
        </div>
    );
}
