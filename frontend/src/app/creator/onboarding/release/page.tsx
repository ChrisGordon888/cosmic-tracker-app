"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
    CreatorOnboardingReleaseData,
    GET_CREATOR_ONBOARDING_PROGRESS,
    GET_CREATOR_ONBOARDING_RELEASE,
    SAVE_CREATOR_ONBOARDING_RELEASE,
    SaveCreatorOnboardingReleaseData,
    SaveCreatorOnboardingReleaseVariables,
} from "@/graphql/onboarding";

const RELEASE_TYPES = [
    { value: "single", label: "Single" },
    { value: "ep", label: "EP" },
    { value: "album", label: "Album" },
    { value: "mixtape", label: "Mixtape" },
    { value: "project", label: "Project" },
];

function createSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

function toDateInput(value?: string | null) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().slice(0, 10);
}

export default function CreatorOnboardingReleasePage() {
    const { data, loading, error } =
        useQuery<CreatorOnboardingReleaseData>(
            GET_CREATOR_ONBOARDING_RELEASE,
            { fetchPolicy: "cache-and-network" }
        );

    const [saveRelease, { loading: saving }] = useMutation<
        SaveCreatorOnboardingReleaseData,
        SaveCreatorOnboardingReleaseVariables
    >(SAVE_CREATOR_ONBOARDING_RELEASE);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [releaseType, setReleaseType] = useState("single");
    const [oneLineSummary, setOneLineSummary] = useState("");
    const [story, setStory] = useState("");
    const [fullDropDate, setFullDropDate] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const release = data?.getCreatorOnboardingRelease;

    useEffect(() => {
        if (!release) return;

        setTitle(release.title || "");
        setSlug(release.slug || "");
        setReleaseType(release.releaseType || "single");
        setOneLineSummary(release.oneLineSummary || "");
        setStory(release.story || "");
        setFullDropDate(toDateInput(release.fullDropDate));
        setSlugTouched(true);
    }, [release]);

    useEffect(() => {
        if (!slugTouched) {
            setSlug(createSlug(title));
        }
    }, [title, slugTouched]);

    const canSubmit = useMemo(
        () =>
            title.trim().length > 0 &&
            slug.trim().length >= 2 &&
            !saving,
        [title, slug, saving]
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setFeedback(null);

        try {
            await saveRelease({
                variables: {
                    input: {
                        title: title.trim(),
                        slug: createSlug(slug),
                        releaseType,
                        oneLineSummary: oneLineSummary.trim(),
                        story: story.trim(),
                        fullDropDate: fullDropDate || null,
                    },
                },
                refetchQueries: [
                    { query: GET_CREATOR_ONBOARDING_RELEASE },
                    { query: GET_CREATOR_ONBOARDING_PROGRESS },
                ],
                awaitRefetchQueries: true,
            });

            setSlug(createSlug(slug));
            setFeedback({
                type: "success",
                message:
                    "Release world saved as a private draft. Step 2 is complete.",
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Release world could not be saved.",
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
                        Step 2 of 4
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        Create your first release world.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                        This uses the same Release World system inside Creator
                        OS. Onboarding simply gives you a focused first pass
                        and keeps everything private until the project is ready.
                    </p>
                </section>

                {loading && !release ? (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Loading release world…
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-5 text-sm text-rose-100">
                        {error.message}
                    </div>
                ) : null}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Release title"
                            help="The public-facing title of this project."
                        >
                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={120}
                                placeholder="Name the release"
                                className="form-input"
                                required
                            />
                        </Field>

                        <Field
                            label="Release type"
                            help="Choose the format that best describes the project."
                        >
                            <select
                                value={releaseType}
                                onChange={(event) =>
                                    setReleaseType(event.target.value)
                                }
                                className="form-input"
                            >
                                {RELEASE_TYPES.map((type) => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field
                        label="Release URL"
                        help="This becomes the stable URL identifier for the release."
                    >
                        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-[#DCBA5C]/45">
                            <span className="flex items-center border-r border-white/10 px-3 text-sm text-white/30">
                                /releases/
                            </span>
                            <input
                                value={slug}
                                onChange={(event) => {
                                    setSlugTouched(true);
                                    setSlug(
                                        createSlug(event.target.value)
                                    );
                                }}
                                minLength={2}
                                maxLength={60}
                                placeholder="release-title"
                                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/25"
                                required
                            />
                        </div>
                    </Field>

                    <Field
                        label="One-line summary"
                        help="A concise statement that tells listeners what this release is."
                    >
                        <input
                            value={oneLineSummary}
                            onChange={(event) =>
                                setOneLineSummary(event.target.value)
                            }
                            maxLength={220}
                            placeholder="A short signal describing the release."
                            className="form-input"
                        />
                    </Field>

                    <Field
                        label="Release story"
                        help="Describe the concept, emotional world, or journey behind the project."
                    >
                        <textarea
                            value={story}
                            onChange={(event) =>
                                setStory(event.target.value)
                            }
                            rows={7}
                            maxLength={3000}
                            placeholder="What world does this release open?"
                            className="form-input resize-y"
                        />
                        <div className="mt-2 text-right text-xs text-white/30">
                            {story.length}/3000
                        </div>
                    </Field>

                    <Field
                        label="Target release date"
                        help="Optional. This is planning information and does not publish anything."
                    >
                        <input
                            type="date"
                            value={fullDropDate}
                            onChange={(event) =>
                                setFullDropDate(event.target.value)
                            }
                            className="form-input"
                        />
                    </Field>

                    <div className="rounded-2xl border border-[#DCBA5C]/15 bg-[#DCBA5C]/[0.045] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#F4D982]">
                            Draft protection
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                            Onboarding always saves this release with draft
                            status and private visibility. Publishing remains a
                            deliberate action later in Creator OS.
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
                            Reopening this page edits the same first release
                            rather than creating duplicates.
                        </p>

                        <div className="flex gap-3">
                            {release ? (
                                <Link
                                    href="/creator/onboarding/track"
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
                                    : release
                                      ? "Save changes"
                                      : "Create release"}
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
