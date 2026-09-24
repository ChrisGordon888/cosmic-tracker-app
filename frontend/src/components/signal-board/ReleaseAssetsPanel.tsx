"use client";
import Link from "next/link";
import type { ApolloError } from "@apollo/client";
import type { ReleaseWorld, ReleaseTrack, ReleaseAsset, AssetForm } from "./types";

interface ReleaseAssetsPanelProps {
    slug: string;
    assetsError: ApolloError | undefined;
    assetMessage: string;
    releaseWorld: ReleaseWorld | null | undefined;
    releaseTitle: string;
    releaseAssets: ReleaseAsset[];
    coverAssets: ReleaseAsset[];
    trackAudioAssets: ReleaseAsset[];
    releaseTracks: ReleaseTrack[];
    assetForm: AssetForm;
    handleAssetFileChange: (fileList: FileList | null) => void;
    selectedAssetFile: File | null;
    assetUploadPreviewUrl: string;
    handleUploadAndCreateAsset: () => Promise<void>;
    isUploadingAsset: boolean;
    isCreatingAsset: boolean;
    releaseWorldId: string | undefined;
    updateAssetForm: <K extends keyof AssetForm>(key: K, value: AssetForm[K]) => void;
    assetUsageOptions: { value: string; label: string; }[];
    assetKindOptions: { value: string; label: string; }[];
    handleCreateAsset: () => Promise<void>;
    assetsLoading: boolean;
    getAssetUsageLabel: (usage?: string | null) => string;
    formatLabel: (value?: string | null) => string;
    isDeletingAsset: boolean;
    handleDeleteAsset: (asset: ReleaseAsset) => Promise<void>;
}

export default function ReleaseAssetsPanel({
    slug,
    assetsError,
    assetMessage,
    releaseWorld,
    releaseTitle,
    releaseAssets,
    coverAssets,
    trackAudioAssets,
    releaseTracks,
    assetForm,
    handleAssetFileChange,
    selectedAssetFile,
    assetUploadPreviewUrl,
    handleUploadAndCreateAsset,
    isUploadingAsset,
    isCreatingAsset,
    releaseWorldId,
    updateAssetForm,
    assetUsageOptions,
    assetKindOptions,
    handleCreateAsset,
    assetsLoading,
    getAssetUsageLabel,
    formatLabel,
    isDeletingAsset,
    handleDeleteAsset,
}: ReleaseAssetsPanelProps) {
    return (
        <section className="signal-board-panel-section signal-board-assets-panel">
            <div className="signal-board-panel-heading">
                <div>
                    <p className="signal-board-panel-kicker">Asset Manager</p>
                    <h2>Cover, audio, and references</h2>
                </div>
                <Link href={`/releases/${slug}`}>View Page</Link>
            </div>

            <p className="signal-board-panel-message">
                {assetsError?.message || assetMessage}
            </p>

            <details className="signal-board-help-disclosure signal-board-asset-help">
                <summary>How assets flow through the release</summary>
                <div className="signal-board-help-grid">
                    <span><strong>Cover art</strong> updates the release hero across public surfaces.</span>
                    <span><strong>Track audio</strong> attaches playback directly to a song.</span>
                    <span><strong>References</strong> can stay private or become public creative material later.</span>
                </div>
            </details>

            <div className="signal-board-asset-overview">
                <article className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                    <p className="signal-board-panel-kicker">Current Cover</p>
                    <h2>{releaseWorld?.coverArtUrl ? "Cover synced" : "No cover yet"}</h2>
                    {releaseWorld?.coverArtUrl ? (
                        <div className="signal-board-cover-preview">
                            <img
                                src={releaseWorld.coverArtUrl}
                                alt={`${releaseTitle} cover preview`}
                            />
                            <span>{releaseWorld.coverArtUrl}</span>
                        </div>
                    ) : (
                        <p className="signal-board-empty-note">
                            Register a cover asset to update the release page hero.
                        </p>
                    )}
                </article>

                <article className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                    <p className="signal-board-panel-kicker">Asset Totals</p>
                    <h2>{releaseAssets.length} registered</h2>
                    <div className="signal-board-theme-map">
                        <div>
                            <span>Cover</span>
                            <strong>{coverAssets.length}</strong>
                        </div>
                        <div>
                            <span>Audio</span>
                            <strong>{trackAudioAssets.length}</strong>
                        </div>
                        <div>
                            <span>Tracks</span>
                            <strong>{releaseTracks.length}</strong>
                        </div>
                    </div>
                </article>
            </div>

            <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                <label className="signal-board-wide-field">
                    Asset title
                    <input
                        value={assetForm.title}
                        onChange={(event) =>
                            updateAssetForm("title", event.target.value)
                        }
                        placeholder="Cover art, demo bounce, visual reference..."
                    />
                </label>

                <label>
                    Usage
                    <select
                        value={assetForm.usage}
                        onChange={(event) =>
                            updateAssetForm("usage", event.target.value)
                        }
                    >
                        {assetUsageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Kind
                    <select
                        value={assetForm.kind}
                        onChange={(event) =>
                            updateAssetForm("kind", event.target.value)
                        }
                    >
                        {assetKindOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                {["track-audio", "track-artwork"].includes(assetForm.usage) && (
                    <label className="signal-board-wide-field">
                        Attach to track
                        <select
                            value={assetForm.trackId}
                            onChange={(event) =>
                                updateAssetForm("trackId", event.target.value)
                            }
                        >
                            <option value="">Choose track</option>
                            {releaseTracks.map((track) => (
                                <option key={track.id} value={track.id}>
                                    {String(track.trackNumber).padStart(2, "0")} — {track.title}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="signal-board-wide-field">
                    Description
                    <textarea
                        value={assetForm.description}
                        onChange={(event) =>
                            updateAssetForm("description", event.target.value)
                        }
                        rows={3}
                        placeholder="What is this asset for?"
                    />
                </label>
            </div>

            <div className="signal-board-asset-visibility">
                <div>
                    <span className="signal-board-control-label">Visibility</span>
                    <small>{assetForm.isPublic ? "Available to public release surfaces" : "Private to the creator workspace"}</small>
                </div>
                <label className={assetForm.isPublic ? "is-active" : ""}>
                    <input
                        type="checkbox"
                        checked={assetForm.isPublic}
                        onChange={(event) =>
                            updateAssetForm("isPublic", event.target.checked)
                        }
                    />
                    Public asset
                </label>
            </div>

            <div className="signal-board-upload-card" aria-label="Upload asset to Vercel Blob">
                <div className="signal-board-upload-copy">
                    <p className="signal-board-panel-kicker">Cloud Upload</p>
                    <h3>Upload a file from your computer</h3>
                    <span>Attach a cover, track audio, artwork, or supporting reference to this release.</span>
                </div>

                <label className="signal-board-file-drop">
                    <input
                        type="file"
                        accept={
                            assetForm.usage === "track-audio"
                                ? "audio/*"
                                : assetForm.usage === "track-artwork"
                                    ? "image/*"
                                    : assetForm.kind === "video"
                                        ? "video/*"
                                        : assetForm.kind === "document"
                                            ? ".pdf,.txt,.doc,.docx"
                                            : "image/*,audio/*,video/*,.pdf"
                        }
                        onChange={(event) =>
                            handleAssetFileChange(event.currentTarget.files)
                        }
                    />
                    <strong>{selectedAssetFile ? selectedAssetFile.name : "Choose file"}</strong>
                    <span>Cover art, audio bounce, promo visual, or reference file</span>
                </label>

                {assetUploadPreviewUrl && (
                    <div className="signal-board-upload-preview">
                        <img src={assetUploadPreviewUrl} alt="Selected asset preview" />
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleUploadAndCreateAsset}
                    disabled={isUploadingAsset || isCreatingAsset || !releaseWorldId || !selectedAssetFile}
                >
                    {isUploadingAsset ? "Uploading..." : "Upload + Register Asset"}
                </button>
            </div>

            <details className="signal-board-workspace-disclosure">
                <summary>Register existing media by URL</summary>
                <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                    <label className="signal-board-wide-field">
                        Asset URL
                        <input
                            value={assetForm.url}
                            onChange={(event) =>
                                updateAssetForm("url", event.target.value)
                            }
                            placeholder="/cover.jpg, /music/demo.mp3, or external URL"
                        />
                    </label>

                    <label>
                        File name
                        <input
                            value={assetForm.fileName}
                            onChange={(event) =>
                                updateAssetForm("fileName", event.target.value)
                            }
                            placeholder="cover.jpg"
                        />
                    </label>

                    <label>
                        MIME type
                        <input
                            value={assetForm.mimeType}
                            onChange={(event) =>
                                updateAssetForm("mimeType", event.target.value)
                            }
                            placeholder="image/jpeg or audio/mpeg"
                        />
                    </label>

                </div>
                <div className="signal-board-panel-actions">
                    <button
                        type="button"
                        onClick={handleCreateAsset}
                        disabled={isCreatingAsset || !releaseWorldId}
                    >
                        {isCreatingAsset ? "Registering..." : "Register Asset"}
                    </button>
                </div>

            </details>

            <div className="signal-board-asset-list" aria-label="Registered assets">
                {assetsLoading && (
                    <p className="signal-board-empty-note">Loading assets...</p>
                )}
                {!assetsLoading && releaseAssets.length === 0 && (
                    <p className="signal-board-empty-note">
                        No assets yet. Register a cover URL or track audio URL to start.
                    </p>
                )}
                {releaseAssets.map((asset) => {
                    const attachedTrack = releaseTracks.find(
                        (track) => track.id === asset.trackId,
                    );

                    return (
                        <article key={asset.id} className="signal-board-asset-card">
                            <div className="signal-board-asset-card-copy">
                                <p className="signal-board-panel-kicker">
                                    {getAssetUsageLabel(asset.usage)} / {formatLabel(asset.kind)}
                                </p>
                                <h3>{asset.title}</h3>
                                {asset.description && <p>{asset.description}</p>}
                                {attachedTrack && <span>Attached to {attachedTrack.title}</span>}
                                <span>{asset.fileName || asset.url}</span>
                            </div>

                            <div className="signal-board-asset-card-actions">
                                <a href={asset.url} target="_blank" rel="noreferrer">
                                    Open
                                </a>
                                <button
                                    type="button"
                                    className="signal-board-danger-mini signal-board-asset-delete"
                                    disabled={isDeletingAsset}
                                    onClick={() => handleDeleteAsset(asset)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
