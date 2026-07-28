"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
    CreatorOnboardingProfileData,
    GET_CREATOR_ONBOARDING_PROFILE,
    GET_CREATOR_ONBOARDING_PROGRESS,
    SAVE_CREATOR_ONBOARDING_PROFILE,
    SaveCreatorOnboardingProfileData,
    SaveCreatorOnboardingProfileVariables,
} from "@/graphql/onboarding";

function createSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

export default function CreatorOnboardingProfilePage() {
    const { data, loading, error } =
        useQuery<CreatorOnboardingProfileData>(
            GET_CREATOR_ONBOARDING_PROFILE,
            { fetchPolicy: "cache-and-network" }
        );

    const [saveProfile, { loading: saving }] = useMutation<
        SaveCreatorOnboardingProfileData,
        SaveCreatorOnboardingProfileVariables
    >(SAVE_CREATOR_ONBOARDING_PROFILE);

    const [artistName, setArtistName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [slug, setSlug] = useState("");
    const [tagline, setTagline] = useState("");
    const [bio, setBio] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const profile = data?.getCreatorOnboardingProfile;

    useEffect(() => {
        if (!profile) return;

        setArtistName(profile.artistName || "");
        setDisplayName(profile.displayName || "");
        setSlug(profile.slug || "");
        setTagline(profile.tagline || "");
        setBio(profile.bio || "");
        setIsPublic(Boolean(profile.isPublic));
        setSlugTouched(true);
    }, [profile]);

    useEffect(() => {
        if (!slugTouched) {
            setSlug(createSlug(artistName));
        }
    }, [artistName, slugTouched]);

    const canSubmit = useMemo(
        () =>
            artistName.trim().length > 0 &&
            slug.trim().length >= 2 &&
            !saving,
        [artistName, slug, saving]
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setFeedback(null);

        try {
            await saveProfile({
                variables: {
                    input: {
                        artistName: artistName.trim(),
                        displayName:
                            displayName.trim() || artistName.trim(),
                        slug: createSlug(slug),
                        tagline: tagline.trim(),
                        bio: bio.trim(),
                        isPublic,
                    },
                },
                refetchQueries: [
                    { query: GET_CREATOR_ONBOARDING_PROFILE },
                    { query: GET_CREATOR_ONBOARDING_PROGRESS },
                ],
                awaitRefetchQueries: true,
            });

            setSlug(createSlug(slug));
            setFeedback({
                type: "success",
                message:
                    "Artist identity saved. Your first onboarding step is complete.",
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Artist identity could not be saved.",
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
                        Step 1 of 4
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        Define your artist identity.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                        This foundation will appear across releases,
                        public pages, and the creator workspace. It can
                        evolve later; begin with a clear name and direction.
                    </p>
                </section>

                {loading && !profile ? (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Loading artist identity…
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
                            label="Artist name"
                            help="The primary name attached to your creative work."
                        >
                            <input
                                value={artistName}
                                onChange={(event) =>
                                    setArtistName(event.target.value)
                                }
                                maxLength={80}
                                placeholder="Your artist name"
                                className="form-input"
                                required
                            />
                        </Field>

                        <Field
                            label="Display name"
                            help="Optional alternate presentation of your name."
                        >
                            <input
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                maxLength={80}
                                placeholder={artistName || "Display name"}
                                className="form-input"
                            />
                        </Field>
                    </div>

                    <Field
                        label="Creator URL"
                        help="Lowercase letters, numbers, and hyphens."
                    >
                        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-[#DCBA5C]/45">
                            <span className="flex items-center border-r border-white/10 px-3 text-sm text-white/30">
                                /creators/
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
                                placeholder="artist-name"
                                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/25"
                                required
                            />
                        </div>
                    </Field>

                    <Field
                        label="Tagline"
                        help="One sentence introducing the feeling or purpose of your work."
                    >
                        <input
                            value={tagline}
                            onChange={(event) =>
                                setTagline(event.target.value)
                            }
                            maxLength={160}
                            placeholder="A traveler turning inner worlds into sound."
                            className="form-input"
                        />
                    </Field>

                    <Field
                        label="Short biography"
                        help="Describe who you are, what you create, and what listeners should understand."
                    >
                        <textarea
                            value={bio}
                            onChange={(event) =>
                                setBio(event.target.value)
                            }
                            rows={6}
                            maxLength={1200}
                            placeholder="Tell listeners about your creative identity…"
                            className="form-input resize-y"
                        />
                        <div className="mt-2 text-right text-xs text-white/30">
                            {bio.length}/1200
                        </div>
                    </Field>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(event) =>
                                setIsPublic(event.target.checked)
                            }
                            className="mt-1 h-4 w-4"
                        />
                        <span>
                            <span className="block text-sm font-medium text-white">
                                Make artist identity public
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-white/45">
                                Leave this off while the creator world is
                                still being prepared.
                            </span>
                        </span>
                    </label>

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
                            Saving does not publish a release or activate
                            the creator account.
                        </p>

                        <div className="flex gap-3">
                            {profile ? (
                                <Link
                                    href="/creator/onboarding/release"
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
                                    : profile
                                      ? "Save changes"
                                      : "Save identity"}
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
