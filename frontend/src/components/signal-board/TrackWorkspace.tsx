"use client";
import type * as React from "react";
import type { DragEvent } from "react";
import type { ApolloError } from "@apollo/client";
import type { ReleaseTrack, TrackForm, ReleaseAsset, RealmFinderRealmId, RealmFinderQuestion, PublishSignalCheck } from "./types";

interface TrackWorkspaceProps {
    isCreatingNewTrack: boolean;
    selectedTrack: ReleaseTrack | null;
    handleNewTrack: () => void;
    tracksError: ApolloError | undefined;
    trackMessage: string;
    tracksLoading: boolean;
    releaseTracks: ReleaseTrack[];
    selectedTrackId: string | null;
    handleSelectTrack: (track: ReleaseTrack) => void;
    trackForm: TrackForm;
    updateTrackForm: <K extends keyof TrackForm>(key: K, value: TrackForm[K]) => void;
    handleTrackArtworkDrop: (event: DragEvent<HTMLLabelElement>) => void;
    selectedTrackArtworkAsset: ReleaseAsset | null;
    isUploadingTrackArtwork: boolean;
    trackArtworkMessage: string;
    handleTrackArtworkFile: (file: File | null) => Promise<void>;
    trackRoleOptions: { value: string; label: string; }[];
    trackStatusOptions: { value: string; label: string; }[];
    handleManageTrackAudio: () => void;
    trackVisibilityOptions: { value: string; label: string; }[];
    playbackStatusOptions: { value: string; label: string; }[];
    realmPublishingOptions: { value: string; label: string; }[];
    realmFinderRealms: Record<RealmFinderRealmId, { name: string; core: string; summary: string; signals: string[]; }>;
    publishSignalState: "Published" | "In review" | "Needs changes" | "Approved" | "Ready for review" | "Draft";
    isRealmFinderOpen: boolean;
    setIsRealmFinderOpen: React.Dispatch<React.SetStateAction<boolean>>;
    realmFinderIsComplete: boolean;
    realmFinderQuestion: RealmFinderQuestion;
    realmFinderStep: number;
    realmFinderQuestions: RealmFinderQuestion[];
    realmFinderAnswers: Record<string, string>;
    handleRealmFinderAnswer: (questionId: string, optionId: string) => void;
    setRealmFinderStep: React.Dispatch<React.SetStateAction<number>>;
    handleRealmFinderReset: () => void;
    realmFinderResult: {
        realmId: RealmFinderRealmId;
        score: number;
        runnerUp: { realmId: RealmFinderRealmId; score: number; };
        trace: { realmId: RealmFinderRealmId; score: number; };
        meta: TrackWorkspaceProps["realmFinderRealms"][RealmFinderRealmId];
        runnerUpMeta: TrackWorkspaceProps["realmFinderRealms"][RealmFinderRealmId];
        traceMeta: TrackWorkspaceProps["realmFinderRealms"][RealmFinderRealmId];
        dominantSignal: string;
        explanation: string;
        resonanceScores: Record<RealmFinderRealmId, number>;
    };
    handleUseRealmFinderResult: () => void;
    publishSignalReadiness: { checks: PublishSignalCheck[]; ready: boolean; missing: string[]; };
    handleSubmitForNexusReview: () => Promise<void>;
    isSubmittingNexusReview: boolean;
    isCreatingTrack: boolean;
    isUpdatingTrack: boolean;
    nexusReviewStatus: string;
    handleSaveTrack: () => Promise<void>;
    releaseWorldId: string | undefined;
    handleDeleteTrack: () => Promise<void>;
    isDeletingTrack: boolean;
}

export default function TrackWorkspace({
    isCreatingNewTrack,
    selectedTrack,
    handleNewTrack,
    tracksError,
    trackMessage,
    tracksLoading,
    releaseTracks,
    selectedTrackId,
    handleSelectTrack,
    trackForm,
    updateTrackForm,
    handleTrackArtworkDrop,
    selectedTrackArtworkAsset,
    isUploadingTrackArtwork,
    trackArtworkMessage,
    handleTrackArtworkFile,
    trackRoleOptions,
    trackStatusOptions,
    handleManageTrackAudio,
    trackVisibilityOptions,
    playbackStatusOptions,
    realmPublishingOptions,
    realmFinderRealms,
    publishSignalState,
    isRealmFinderOpen,
    setIsRealmFinderOpen,
    realmFinderIsComplete,
    realmFinderQuestion,
    realmFinderStep,
    realmFinderQuestions,
    realmFinderAnswers,
    handleRealmFinderAnswer,
    setRealmFinderStep,
    handleRealmFinderReset,
    realmFinderResult,
    handleUseRealmFinderResult,
    publishSignalReadiness,
    handleSubmitForNexusReview,
    isSubmittingNexusReview,
    isCreatingTrack,
    isUpdatingTrack,
    nexusReviewStatus,
    handleSaveTrack,
    releaseWorldId,
    handleDeleteTrack,
    isDeletingTrack,
}: TrackWorkspaceProps) {
    return (
        <section className="signal-board-panel-section">
            <div className="signal-board-panel-heading">
                <div>
                    <p className="signal-board-panel-kicker">Track Manager</p>
                    <h2>
                        {isCreatingNewTrack
                            ? "New track"
                            : selectedTrack
                                ? "Edit track"
                                : "Tracks"}
                    </h2>
                </div>
                <button type="button" onClick={handleNewTrack}>
                    Start New
                </button>
            </div>

            <p className="signal-board-panel-message">
                {tracksError?.message || trackMessage}
            </p>

            <div
                className="signal-board-track-strip"
                aria-label="Release tracks"
            >
                {tracksLoading && (
                    <p className="signal-board-empty-note">Loading tracks...</p>
                )}
                {!tracksLoading && releaseTracks.length === 0 && (
                    <p className="signal-board-empty-note">
                        No tracks yet. Start New to add the first song.
                    </p>
                )}
                {releaseTracks.map((track) => (
                    <button
                        key={track.id}
                        type="button"
                        className={
                            selectedTrackId === track.id && !isCreatingNewTrack
                                ? "is-active"
                                : ""
                        }
                        onClick={() => handleSelectTrack(track)}
                    >
                        <span>{String(track.trackNumber).padStart(2, "0")}</span>
                        <strong>{track.title}</strong>
                        <em>
                            {track.role}
                            {track.isFocusTrack ? " • Focus" : ""}
                            {track.isSecondFocus ? " • Second" : ""}
                        </em>
                    </button>
                ))}
            </div>

            <div className="signal-board-track-workflow">
                <section className="signal-board-track-section-card">
                    <div className="signal-board-track-section-heading">
                        <div><p className="signal-board-panel-kicker">Song</p><h3>Shape the record</h3></div>
                        <span>Identity, creative context, and production notes.</span>
                    </div>
                    <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                        <label className="signal-board-wide-field">
                            Title
                            <input
                                value={trackForm.title}
                                onChange={(event) =>
                                    updateTrackForm("title", event.target.value)
                                }
                                placeholder="Track title"
                            />
                        </label>

                        <label
                            className="signal-board-wide-field"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={handleTrackArtworkDrop}
                        >
                            Artwork
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "8px",
                                    border: "1px dashed rgba(247, 239, 228, 0.18)",
                                    borderRadius: "12px",
                                    background: "rgba(255,255,255,0.025)",
                                }}
                            >
                                {selectedTrackArtworkAsset?.url ? (
                                    <img
                                        src={selectedTrackArtworkAsset.url}
                                        alt=""
                                        style={{
                                            width: "38px",
                                            height: "38px",
                                            borderRadius: "9px",
                                            objectFit: "cover",
                                            flex: "0 0 38px",
                                        }}
                                    />
                                ) : null}

                                <span style={{ minWidth: 0, flex: 1 }}>
                                    <strong style={{ display: "block" }}>
                                        {isUploadingTrackArtwork
                                            ? "Uploading..."
                                            : selectedTrackArtworkAsset
                                                ? "Drop or choose to replace"
                                                : selectedTrackId && !isCreatingNewTrack
                                                    ? "Drop or choose artwork"
                                                    : "Save track first"}
                                    </strong>
                                    <span className="signal-board-field-note">
                                        {trackArtworkMessage || "JPG, PNG, WebP, or GIF"}
                                    </span>
                                </span>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    disabled={
                                        isUploadingTrackArtwork ||
                                        !selectedTrackId ||
                                        isCreatingNewTrack
                                    }
                                    onChange={(event) => {
                                        void handleTrackArtworkFile(
                                            event.currentTarget.files?.[0] ?? null,
                                        );
                                        event.currentTarget.value = "";
                                    }}
                                    style={{ maxWidth: "180px" }}
                                />
                            </span>
                        </label>
                        <label>
                            #
                            <input
                                type="number"
                                min="1"
                                value={trackForm.trackNumber}
                                onChange={(event) =>
                                    updateTrackForm("trackNumber", event.target.value)
                                }
                            />
                        </label>
                        <label>
                            Role
                            <select
                                value={trackForm.role}
                                onChange={(event) =>
                                    updateTrackForm("role", event.target.value)
                                }
                            >
                                {trackRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Status
                            <select
                                value={trackForm.status}
                                onChange={(event) =>
                                    updateTrackForm("status", event.target.value)
                                }
                            >
                                {trackStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            BPM
                            <input
                                type="number"
                                min="1"
                                value={trackForm.bpm}
                                onChange={(event) =>
                                    updateTrackForm("bpm", event.target.value)
                                }
                                placeholder="140"
                            />
                        </label>
                        <label>
                            Key
                            <input
                                value={trackForm.keySignature}
                                onChange={(event) =>
                                    updateTrackForm("keySignature", event.target.value)
                                }
                                placeholder="F minor"
                            />
                        </label>
                        <label className="signal-board-wide-field">
                            Mood
                            <input
                                value={trackForm.mood}
                                onChange={(event) =>
                                    updateTrackForm("mood", event.target.value)
                                }
                                placeholder="blue chrome night drive"
                            />
                        </label>
                        <label className="signal-board-wide-field">
                            Audio / master URL
                            <input
                                value={trackForm.audioUrl}
                                onChange={(event) =>
                                    updateTrackForm("audioUrl", event.target.value)
                                }
                                placeholder="/audio/song.mp3 or external URL"
                            />
                        </label>
                        <div className="signal-board-wide-field signal-board-audio-assets">
                            <button type="button" disabled={!selectedTrackId || isCreatingNewTrack} onClick={handleManageTrackAudio}>Manage audio in Assets</button>
                            <span className="signal-board-field-note">Upload audio for this track in Assets, or keep an existing audio URL above. Save a new track before attaching assets.</span>
                        </div>
                        <label className="signal-board-wide-field">
                            Hook
                            <textarea
                                value={trackForm.hook}
                                onChange={(event) =>
                                    updateTrackForm("hook", event.target.value)
                                }
                                rows={3}
                                placeholder="Main hook or signal line"
                            />
                        </label>
                        <label className="signal-board-wide-field">
                            Notes
                            <textarea
                                value={trackForm.notes}
                                onChange={(event) =>
                                    updateTrackForm("notes", event.target.value)
                                }
                                rows={3}
                                placeholder="Production notes, story notes, rollout notes..."
                            />
                        </label>
                    </div>
                    <div className="signal-board-campaign-control">
                        <span className="signal-board-control-label">Release focus</span>
                        <div className="signal-board-campaign-toggles">
                            <label className={trackForm.isFocusTrack ? "is-active" : ""}><input type="checkbox" checked={trackForm.isFocusTrack} onChange={(event) => updateTrackForm("isFocusTrack", event.target.checked)} /> Primary focus</label>
                            <label className={trackForm.isSecondFocus ? "is-active" : ""}><input type="checkbox" checked={trackForm.isSecondFocus} onChange={(event) => updateTrackForm("isSecondFocus", event.target.checked)} /> Secondary focus</label>
                        </div>
                    </div>
                </section>

                <details className="signal-board-track-section-card signal-board-workspace-disclosure">
                    <summary>Listener settings</summary>
                    <details className="signal-board-help-disclosure">
                        <summary>How release controls work</summary>
                        <div className="signal-board-help-grid">
                            <span><strong>Visibility</strong> — Listed/Public appears on the Release Page.</span>
                            <span><strong>Playback</strong> — Locked, preview, or full playable audio.</span>
                            <span><strong>Dates</strong> — Drop and unlock timing shape listener access.</span>
                        </div>
                    </details>


                    <div className="signal-board-track-section-heading">
                        <div><p className="signal-board-panel-kicker">Release</p><h3>Control the listener path</h3></div>
                        <span>Visibility, playback, dates, previews, and destination links.</span>
                    </div>
                    <div className="signal-board-track-form-grid signal-board-track-form-grid-compact">
                        <label>
                            Visibility
                            <select
                                value={trackForm.visibility}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    updateTrackForm("visibility", value);
                                    updateTrackForm("isPublic", value === "public" || value === "listed");
                                }}
                            >
                                {trackVisibilityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="signal-board-field-note">
                                Private stays hidden. Listed appears inside this release. Public can appear on broader surfaces later.
                            </span>
                        </label>
                        <label>
                            Playback
                            <select
                                value={trackForm.playbackStatus}
                                onChange={(event) =>
                                    updateTrackForm("playbackStatus", event.target.value)
                                }
                            >
                                {playbackStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="signal-board-field-note">
                                Locked shows the track without audio. Preview needs Preview Audio URL. Playable uses full Audio URL.
                            </span>
                        </label>
                        <label>
                            Drop Date
                            <input
                                type="date"
                                value={trackForm.dropDate}
                                onChange={(event) =>
                                    updateTrackForm("dropDate", event.target.value)
                                }
                            />
                        </label>
                        <label>
                            Unlock Date
                            <input
                                type="date"
                                value={trackForm.unlockDate}
                                onChange={(event) =>
                                    updateTrackForm("unlockDate", event.target.value)
                                }
                            />
                        </label>
                        <label className="signal-board-wide-field">
                            Preview Audio URL
                            <input
                                value={trackForm.previewAudioUrl}
                                onChange={(event) =>
                                    updateTrackForm("previewAudioUrl", event.target.value)
                                }
                                placeholder="15–30 second teaser audio URL"
                            />
                            <span className="signal-board-field-note">
                                Public preview uses this URL only. It will not fall back to the full track.
                            </span>
                        </label>
                        <label className="signal-board-wide-field">
                            Platform URL
                            <input
                                value={trackForm.platformUrl}
                                onChange={(event) =>
                                    updateTrackForm("platformUrl", event.target.value)
                                }
                                placeholder="Spotify, SoundCloud, YouTube, or pre-save link"
                            />
                        </label>
                    </div>
                </details>

                <details className="signal-board-track-section-card signal-board-track-section-nexus signal-board-workspace-disclosure">
                    <summary>Realm &amp; Nexus</summary>
                    <div className="signal-board-track-section-heading">
                        <div><p className="signal-board-panel-kicker">Nexus + Realm</p><h3>Prepare the signal</h3></div>
                        <span>Choose the Realm that feels right, then submit the signal for Cosmic review when it is ready.</span>
                    </div>

                    <div className="signal-board-track-form-grid signal-board-track-form-grid-compact signal-board-nexus-grid">
                        <label>
                            Suggested Realm
                            <select
                                value={trackForm.realmId}
                                onChange={(event) => updateTrackForm("realmId", event.target.value)}
                            >
                                {realmPublishingOptions.map((option) => (
                                    <option key={option.value || "none"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="signal-board-field-note">
                                Choose the Realm you feel best matches the signal. Cosmic review can approve or adjust the final placement.
                            </span>
                        </label>

                        {trackForm.realmFinderSuggestedRealmId && (
                            <div className="signal-board-realm-finder-saved">
                                <span>Realm Profile snapshot</span>
                                <strong>
                                    Home suggestion · {trackForm.realmFinderSuggestedRealmId} — {realmFinderRealms[Number(trackForm.realmFinderSuggestedRealmId) as RealmFinderRealmId]?.name}
                                </strong>
                                <small>
                                    {trackForm.realmFinderSecondaryRealmId ? `Secondary ${trackForm.realmFinderSecondaryRealmId}` : ""}
                                    {trackForm.realmFinderTraceRealmId ? ` · Trace ${trackForm.realmFinderTraceRealmId}` : ""}
                                </small>
                                {trackForm.realmFinderDominantSignal && <em>{trackForm.realmFinderDominantSignal}</em>}
                            </div>
                        )}

                        <div className="signal-board-nexus-status">
                            <span>Nexus review</span>
                            <strong>{publishSignalState}</strong>
                            <small>{trackForm.showInNexus ? "Live in Nexus" : "Creator submission workflow"}</small>
                        </div>
                    </div>

                    <section className={`signal-board-realm-finder${isRealmFinderOpen ? " is-open" : ""}`}>
                        <button
                            type="button"
                            className="signal-board-realm-finder-toggle"
                            onClick={() => setIsRealmFinderOpen((current) => !current)}
                            aria-expanded={isRealmFinderOpen}
                        >
                            <span>
                                <small>Realm Finder</small>
                                <strong>Need help choosing a Realm?</strong>
                            </span>
                            <em>{isRealmFinderOpen ? "Close" : "Find My Realm"}</em>
                        </button>

                        {isRealmFinderOpen && (
                            <div className="signal-board-realm-finder-body">
                                {!realmFinderIsComplete ? (
                                    <>
                                        <div className="signal-board-realm-finder-progress">
                                            <span>
                                                {realmFinderQuestion.eyebrow}
                                            </span>
                                            <strong>
                                                {realmFinderStep + 1} / {realmFinderQuestions.length}
                                            </strong>
                                        </div>

                                        <div className="signal-board-realm-finder-question">
                                            <h4>{realmFinderQuestion.prompt}</h4>
                                            <p>Choose what feels closest. There is no permanent answer here.</p>
                                        </div>

                                        <div className="signal-board-realm-finder-options">
                                            {realmFinderQuestion.options.map((option) => {
                                                const isSelected =
                                                    realmFinderAnswers[realmFinderQuestion.id] === option.id;

                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        className={isSelected ? "is-selected" : ""}
                                                        onClick={() =>
                                                            handleRealmFinderAnswer(
                                                                realmFinderQuestion.id,
                                                                option.id,
                                                            )
                                                        }
                                                    >
                                                        <strong>{option.label}</strong>
                                                        <span>{option.detail}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="signal-board-realm-finder-nav">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRealmFinderStep((current) =>
                                                        Math.max(0, current - 1)
                                                    )
                                                }
                                                disabled={realmFinderStep === 0}
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRealmFinderReset}
                                                disabled={Object.keys(realmFinderAnswers).length === 0}
                                            >
                                                Start over
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="signal-board-realm-finder-result">
                                        <div className="signal-board-realm-finder-result-topline">
                                            <span>Realm Profile</span>
                                            <small>{realmFinderResult.dominantSignal}</small>
                                        </div>

                                        <div className="signal-board-realm-profile-top-three">
                                            <article className="is-home">
                                                <span>Home suggestion</span>
                                                <strong>{realmFinderResult.realmId} — {realmFinderResult.meta.name}</strong>
                                            </article>
                                            <article>
                                                <span>Secondary resonance</span>
                                                <strong>{realmFinderResult.runnerUp.realmId} — {realmFinderResult.runnerUpMeta.name}</strong>
                                            </article>
                                            <article>
                                                <span>Trace resonance</span>
                                                <strong>{realmFinderResult.trace.realmId} — {realmFinderResult.traceMeta.name}</strong>
                                            </article>
                                        </div>

                                        <p>{realmFinderResult.explanation}</p>

                                        <details className="signal-board-realm-profile-details">
                                            <summary>View full Realm resonance</summary>
                                            <div className="signal-board-realm-profile-bars">
                                                {([303, 202, 101, 55, 44, 0] as RealmFinderRealmId[])
                                                    .sort((a, b) => realmFinderResult.resonanceScores[b] - realmFinderResult.resonanceScores[a])
                                                    .map((realmId) => (
                                                        <div key={realmId} className="signal-board-realm-profile-bar">
                                                            <div>
                                                                <span>{realmId} — {realmFinderRealms[realmId].name}</span>
                                                                <strong>{realmFinderResult.resonanceScores[realmId]}</strong>
                                                            </div>
                                                            <i><b style={{ width: `${realmFinderResult.resonanceScores[realmId]}%` }} /></i>
                                                        </div>
                                                    ))}
                                            </div>
                                        </details>

                                        <div className="signal-board-realm-finder-signals">
                                            {realmFinderResult.meta.signals.map((signal) => (
                                                <span key={signal}>{signal}</span>
                                            ))}
                                        </div>

                                        <div className="signal-board-realm-finder-result-actions">
                                            <button
                                                type="button"
                                                className="is-primary"
                                                onClick={handleUseRealmFinderResult}
                                            >
                                                Use Home Suggestion
                                            </button>
                                            <button type="button" onClick={handleRealmFinderReset}>
                                                Try Again
                                            </button>
                                        </div>

                                        <small className="signal-board-realm-finder-disclaimer">
                                            This is a creative sorting aid. You can still choose another Realm, and Cosmic review can adjust final Nexus placement.
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="signal-board-publish-guide signal-board-nexus-readiness" aria-label="Nexus review readiness">
                        <article>
                            <span>Nexus Review</span>
                            <strong>{publishSignalState}</strong>
                            <p>Submitting sends this track and your suggested Realm to Cosmic staff. Submission does not publish the track into Nexus.</p>
                        </article>
                        {publishSignalReadiness.checks.map((check) => (
                            <article key={check.key}>
                                <span>{check.ready ? "Ready" : "Required"}</span>
                                <strong>{check.ready ? "✓ " : "• "}{check.label}</strong>
                                <p>{check.detail}</p>
                            </article>
                        ))}
                    </div>

                    {selectedTrack?.nexusReviewNotes && (
                        <div className="signal-board-review-note">
                            <span>Review note</span>
                            <p>{selectedTrack.nexusReviewNotes}</p>
                        </div>
                    )}

                    <div className="signal-board-panel-actions signal-board-publish-actions">
                        <button
                            type="button"
                            onClick={() => void handleSubmitForNexusReview()}
                            disabled={
                                isSubmittingNexusReview ||
                                isCreatingTrack ||
                                isUpdatingTrack ||
                                !selectedTrackId ||
                                isCreatingNewTrack ||
                                !publishSignalReadiness.ready ||
                                nexusReviewStatus === "in-review" ||
                                trackForm.showInNexus
                            }
                        >
                            {isSubmittingNexusReview
                                ? "Submitting..."
                                : trackForm.showInNexus
                                    ? "Published to Nexus"
                                    : nexusReviewStatus === "in-review"
                                        ? "Submitted for Review"
                                        : nexusReviewStatus === "approved"
                                            ? "Approved — Awaiting Publish"
                                            : "Submit for Nexus Review"}
                        </button>
                    </div>
                </details>
            </div>

            <footer className="signal-board-track-footer">
                <div className="signal-board-track-save-copy">
                    <span>{isCreatingNewTrack || !selectedTrackId ? "New track" : "Track changes"}</span>
                    <strong>{isCreatingNewTrack || !selectedTrackId ? "Create this track when it is ready." : "Save the edits made to this track."}</strong>
                </div>

                <div className="signal-board-panel-actions signal-board-track-save-actions">
                    <button type="button" onClick={() => void handleSaveTrack()} disabled={isCreatingTrack || isUpdatingTrack || !releaseWorldId}>
                        {isCreatingTrack || isUpdatingTrack ? "Saving..." : isCreatingNewTrack || !selectedTrackId ? "Create Track" : "Update Track"}
                    </button>
                </div>

                {selectedTrackId && !isCreatingNewTrack && (
                    <div className="signal-board-track-danger-zone">
                        <div>
                            <span>Danger zone</span>
                            <strong>Delete this track from the release workspace.</strong>
                        </div>
                        <button
                            type="button"
                            className="signal-board-danger-mini"
                            onClick={handleDeleteTrack}
                            disabled={isDeletingTrack}
                        >
                            {isDeletingTrack ? "Deleting..." : "Delete Track"}
                        </button>
                    </div>
                )}
            </footer>
        </section>
    );
}
