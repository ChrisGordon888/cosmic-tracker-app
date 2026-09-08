"use client";

import Link from "next/link";
import {
    DragEvent,
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import { upload } from "@vercel/blob/client";
import {
    CreatorOnboardingArtworkData,
    GET_CREATOR_ONBOARDING_ARTWORK,
    GET_CREATOR_ONBOARDING_PROGRESS,
    SAVE_CREATOR_ONBOARDING_ARTWORK,
    SaveCreatorOnboardingArtworkData,
    SaveCreatorOnboardingArtworkVariables,
} from "@/graphql/onboarding";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

function looksLikeImage(value: string) {
    if (!value.trim()) return false;

    try {
        const url = new URL(value);
        return ["http:", "https:", "blob:"].includes(url.protocol);
    } catch {
        return value.startsWith("/");
    }
}

function inferFileName(value: string) {
    try {
        const pathname = new URL(value, "https://cosmic.local").pathname;
        return pathname.split("/").filter(Boolean).pop() || "";
    } catch {
        return "";
    }
}

function inferMimeType(fileName: string) {
    const extension = fileName.split(".").pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
    };

    return extension ? mimeTypes[extension] || "" : "";
}

function safeFileName(value: string) {
    return (
        value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "") || "cover"
    );
}

export default function CreatorOnboardingArtworkPage() {
    const { data, loading, error } =
        useQuery<CreatorOnboardingArtworkData>(
            GET_CREATOR_ONBOARDING_ARTWORK,
            { fetchPolicy: "cache-and-network" }
        );

    const [saveArtwork, { loading: saving }] = useMutation<
        SaveCreatorOnboardingArtworkData,
        SaveCreatorOnboardingArtworkVariables
    >(SAVE_CREATOR_ONBOARDING_ARTWORK);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const artwork = data?.getCreatorOnboardingArtwork;

    useEffect(() => {
        if (!artwork) return;

        setTitle(artwork.title || "");
        setDescription(artwork.description || "");
        setUrl(artwork.url || "");
    }, [artwork]);

    useEffect(() => {
        if (!selectedFile) {
            setLocalPreviewUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setLocalPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const fileName = useMemo(
        () => selectedFile?.name || inferFileName(url),
        [selectedFile, url]
    );

    const mimeType = useMemo(
        () => selectedFile?.type || inferMimeType(fileName),
        [selectedFile, fileName]
    );

    const previewUrl = localPreviewUrl || url;
    const busy = uploading || saving;

    const canSubmit =
        (Boolean(selectedFile) || looksLikeImage(url)) &&
        title.trim().length > 0 &&
        !busy;

    function chooseFile(file: File | null) {
        setFeedback(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message: "Choose a JPG, PNG, WebP, or GIF image.",
            });
            return;
        }

        setSelectedFile(file);

        if (!title.trim()) {
            setTitle(
                file.name
                    .replace(/\.[^.]+$/, "")
                    .replace(/[-_]+/g, " ")
                    .trim() || "Release cover"
            );
        }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
        chooseFile(event.dataTransfer.files?.[0] || null);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setFeedback(null);

        try {
            let finalUrl = url.trim();
            let finalFileName = fileName;
            let finalMimeType = mimeType;

            if (selectedFile) {
                setUploading(true);

                const pathname =
                    `release-covers/onboarding/${Date.now()}-${safeFileName(
                        selectedFile.name
                    )}`;

                const uploadResult = await upload(pathname, selectedFile, {
                    access: "public",
                    handleUploadUrl: "/api/upload",
                    clientPayload: JSON.stringify({
                        kind: "cover",
                        usage: "cover",
                        source: "creator-onboarding",
                        originalFileName: selectedFile.name,
                    }),
                });

                finalUrl = uploadResult.url;
                finalFileName = selectedFile.name;
                finalMimeType = selectedFile.type;

                setUrl(uploadResult.url);
                setSelectedFile(null);
            }

            await saveArtwork({
                variables: {
                    input: {
                        title: title.trim(),
                        description: description.trim(),
                        url: finalUrl,
                        fileName: finalFileName,
                        mimeType: finalMimeType,
                    },
                },
                refetchQueries: [
                    { query: GET_CREATOR_ONBOARDING_ARTWORK },
                    { query: GET_CREATOR_ONBOARDING_PROGRESS },
                ],
                awaitRefetchQueries: true,
            });

            setFeedback({
                type: "success",
                message:
                    "Release artwork uploaded, saved, and connected to your release world.",
            });
        } catch (mutationError) {
            setFeedback({
                type: "error",
                message:
                    mutationError instanceof Error
                        ? mutationError.message
                        : "Artwork could not be saved.",
            });
        } finally {
            setUploading(false);
        }
    }

    return (
        <main className="px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/creator/onboarding"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-white/45 transition hover:text-[#F4D982]"
                >
                    ← Onboarding overview
                </Link>

                <section className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182A] via-[#090D17] to-[#05070D] p-6 sm:p-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                        Step 4 of 4
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        Give the release a visual anchor.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                        Drop in your cover artwork. COSMIC uploads it, previews it,
                        and connects it to this release automatically.
                    </p>
                </section>

                {loading && !artwork ? (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
                        Loading release artwork…
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-6 rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-5 text-sm text-rose-100">
                        {error.message}
                    </div>
                ) : null}

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                            Cover preview
                        </p>

                        <div className="mt-4 aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                            {looksLikeImage(previewUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={previewUrl}
                                    alt={title || "Release cover preview"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="grid h-full place-items-center px-8 text-center">
                                    <div>
                                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                                            ✦
                                        </div>
                                        <p className="mt-4 text-sm text-white/45">
                                            Your cover preview will appear here.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {artwork && !selectedFile ? (
                            <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-100">
                                    Existing cover connected
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/45">
                                    Choose another image anytime to replace it.
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
                    >
                        <div>
                            <p className="text-sm font-medium text-white">
                                Release artwork
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/40">
                                Recommended: square JPG, PNG, or WebP.
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(event) =>
                                    chooseFile(event.target.files?.[0] || null)
                                }
                            />

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragEnter={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`mt-3 cursor-pointer rounded-3xl border border-dashed p-8 text-center transition ${
                                    isDragging
                                        ? "border-[#DCBA5C]/60 bg-[#DCBA5C]/10"
                                        : "border-white/15 bg-black/15 hover:border-[#DCBA5C]/35 hover:bg-[#DCBA5C]/[0.05]"
                                }`}
                            >
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                                    ↑
                                </div>
                                <p className="mt-4 text-sm font-medium text-white">
                                    {selectedFile
                                        ? selectedFile.name
                                        : artwork
                                          ? "Drop a new cover to replace it"
                                          : "Drop cover artwork here"}
                                </p>
                                <p className="mt-2 text-xs text-white/40">
                                    or click to choose an image
                                </p>
                            </div>

                            {selectedFile ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                    className="mt-3 text-xs text-white/45 transition hover:text-white/75"
                                >
                                    Remove selected file
                                </button>
                            ) : null}
                        </div>

                        <Field
                            label="Artwork title"
                            help="An internal title for this cover asset."
                        >
                            <input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={160}
                                placeholder="Release cover"
                                className="form-input"
                                required
                            />
                        </Field>

                        <Field
                            label="Description"
                            help="Optional context about the visual direction."
                        >
                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                rows={4}
                                maxLength={1200}
                                placeholder="Describe the visual world…"
                                className="form-input resize-y"
                            />
                        </Field>

                        {(selectedFile || artwork) ? (
                            <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 sm:grid-cols-2">
                                <AssetDetail
                                    label="File name"
                                    value={fileName || "Not detected"}
                                />
                                <AssetDetail
                                    label="Media type"
                                    value={mimeType || "Image"}
                                />
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-[#7ED3FF]/15 bg-[#7ED3FF]/[0.04] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A8E2FF]">
                                Existing artwork is protected
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/50">
                                Reopening this step keeps the current cover until
                                you deliberately replace it.
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
                                {uploading
                                    ? "Uploading cover…"
                                    : saving
                                      ? "Connecting artwork…"
                                      : "Upload and save when the cover feels right."}
                            </p>

                            <div className="flex gap-3">
                                {artwork ? (
                                    <Link
                                        href="/creator/onboarding/review"
                                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10"
                                    >
                                        Review setup
                                    </Link>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F4D982] transition hover:bg-[#DCBA5C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    {uploading
                                        ? "Uploading…"
                                        : saving
                                          ? "Saving…"
                                          : artwork
                                            ? selectedFile
                                                ? "Replace artwork"
                                                : "Save changes"
                                            : "Upload artwork"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
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

function AssetDetail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                {label}
            </p>
            <p className="mt-1 truncate text-sm text-white/65">
                {value}
            </p>
        </div>
    );
}
