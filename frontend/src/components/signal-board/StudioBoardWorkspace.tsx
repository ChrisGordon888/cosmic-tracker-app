"use client";
import type * as React from "react";
import type { CSSProperties, PointerEvent } from "react";
import Link from "next/link";
import type { ArtifactColor, ArtifactSize, ReleaseTrack, HookTargetOption, BoardArtifact } from "./types";

function BoardArtifactCard({
    artifact,
    isSelected,
    onPointerDown,
    onDelete,
    onLayerNudge,
}: {
    artifact: BoardArtifact;
    isSelected: boolean;
    onPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void;
    onDelete: (id: string) => void;
    onLayerNudge: (id: string, direction: -1 | 1) => void;
}) {
    const style = {
        "--pin-x": `${artifact.x}%`,
        "--pin-y": `${artifact.y}%`,
        "--pin-rotate": `${artifact.rotate ?? 0}deg`,
        "--pin-layer": artifact.layer ?? 4,
    } as CSSProperties;

    const className = [
        "signal-board-pin",
        `signal-board-pin-${artifact.kind}`,
        `signal-board-pin-color-${artifact.color ?? "cream"}`,
        `signal-board-pin-size-${artifact.size ?? "md"}`,
        artifact.isUserCreated ? "signal-board-pin-user" : "",
        artifact.isPublic ? "is-public-artifact" : "",
        isSelected ? "is-selected" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <article
            className={className}
            style={style}
            onPointerDown={(event) => onPointerDown(event, artifact.id)}
        >
            <div className="signal-board-pin-cap" />
            {artifact.isPublic && <span className="signal-board-page-badge">Page</span>}

            {artifact.isUserCreated && (
                <button
                    type="button"
                    className="signal-board-delete"
                    aria-label={`Delete ${artifact.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(artifact.id);
                    }}
                >
                    ×
                </button>
            )}

            {artifact.kind === "cover" && (
                <div className="signal-board-cover-stack">
                    <span>EP</span>
                    <span>01</span>
                    <span>02</span>
                </div>
            )}

            {artifact.kind === "hook" && (
                <div className="signal-board-hook-mark">“</div>
            )}

            <div className="signal-board-pin-content">
                <div className="signal-board-pin-topline">
                    <p className="signal-board-pin-eyebrow">{artifact.eyebrow}</p>
                    <span className="signal-board-layer-badge">
                        L{artifact.layer ?? 4}
                    </span>
                </div>
                <h2>{artifact.title}</h2>
                <p className="signal-board-pin-body">{artifact.body}</p>
            </div>

            <div className="signal-board-pin-footer">
                {artifact.meta && (
                    <span className="signal-board-pin-pill">{artifact.meta}</span>
                )}

                <div className="signal-board-pin-tools">
                    <button
                        type="button"
                        aria-label={`Move ${artifact.title} down one layer`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onLayerNudge(artifact.id, -1);
                        }}
                    >
                        −
                    </button>
                    <button
                        type="button"
                        aria-label={`Move ${artifact.title} up one layer`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onLayerNudge(artifact.id, 1);
                        }}
                    >
                        +
                    </button>
                </div>

                {artifact.href && (
                    <Link
                        href={artifact.href}
                        className="signal-board-pin-link"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                    >
                        Open
                    </Link>
                )}
            </div>
        </article>
    );
}

interface StudioBoardWorkspaceProps {
    activePanel: "tracks" | "assets" | "signals" | "portal";
    cloudStatus: "Finding release world..." | "Release lookup error" | "Loading cloud board..." | "Cloud load error" | "Cloud board loaded" | "Project board ready" | "Release world not found";
    handleReloadCloudBoard: () => Promise<void>;
    handleSaveToCloud: () => Promise<void>;
    isSaving: boolean;
    releaseWorldId: string | undefined;
    cloudMessage: string;
    artifacts: BoardArtifact[];
    releaseTracks: ReleaseTrack[];
    hookCounts: { slug: string; title: string; meta: string; count: number; }[];
    boardRef: React.RefObject<HTMLElement | null>;
    releaseTitle: string;
    selectedArtifactId: string | null;
    handleArtifactPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void;
    deleteArtifact: (id: string) => void;
    nudgeLayer: (id: string, direction: -1 | 1) => void;
    selectedArtifact: BoardArtifact | null;
    updateArtifact: (id: string, updates: Partial<BoardArtifact>) => void;
    colorOptions: { value: ArtifactColor; label: string; }[];
    sizeOptions: { value: ArtifactSize; label: string; }[];
    layerOptions: number[];
    pageSectionOptions: { value: string; label: string; }[];
    resetBoard: () => void;
    createMode: "hook" | "note";
    setCreateMode: React.Dispatch<React.SetStateAction<"hook" | "note">>;
    selectedTrackSlug: string;
    setSelectedTrackSlug: React.Dispatch<React.SetStateAction<string>>;
    hookTargetOptions: HookTargetOption[];
    hookTitle: string;
    setHookTitle: React.Dispatch<React.SetStateAction<string>>;
    hookDescription: string;
    setHookDescription: React.Dispatch<React.SetStateAction<string>>;
    addHook: () => void;
    noteTag: string;
    setNoteTag: React.Dispatch<React.SetStateAction<string>>;
    noteTitle: string;
    setNoteTitle: React.Dispatch<React.SetStateAction<string>>;
    noteBody: string;
    setNoteBody: React.Dispatch<React.SetStateAction<string>>;
    addNoteArtifact: () => void;
    selectedColor: ArtifactColor;
    selectedSize: ArtifactSize;
    getHookTargetTitle: (slug: string, options: HookTargetOption[]) => string;
    selectedLayer: number;
    setSelectedColor: React.Dispatch<React.SetStateAction<ArtifactColor>>;
    setSelectedSize: React.Dispatch<React.SetStateAction<ArtifactSize>>;
    setSelectedLayer: React.Dispatch<React.SetStateAction<number>>;
    boardColor: ArtifactColor;
    applyStarterBoardColor: (nextColor: ArtifactColor) => void;
}

export default function StudioBoardWorkspace({
    activePanel,
    cloudStatus,
    handleReloadCloudBoard,
    handleSaveToCloud,
    isSaving,
    releaseWorldId,
    cloudMessage,
    artifacts,
    releaseTracks,
    hookCounts,
    boardRef,
    releaseTitle,
    selectedArtifactId,
    handleArtifactPointerDown,
    deleteArtifact,
    nudgeLayer,
    selectedArtifact,
    updateArtifact,
    colorOptions,
    sizeOptions,
    layerOptions,
    pageSectionOptions,
    resetBoard,
    createMode,
    setCreateMode,
    selectedTrackSlug,
    setSelectedTrackSlug,
    hookTargetOptions,
    hookTitle,
    setHookTitle,
    hookDescription,
    setHookDescription,
    addHook,
    noteTag,
    setNoteTag,
    noteTitle,
    setNoteTitle,
    noteBody,
    setNoteBody,
    addNoteArtifact,
    selectedColor,
    selectedSize,
    getHookTargetTitle,
    selectedLayer,
    setSelectedColor,
    setSelectedSize,
    setSelectedLayer,
    boardColor,
    applyStarterBoardColor,
}: StudioBoardWorkspaceProps) {
    return (
        <div hidden={activePanel !== "signals"} className="signal-board-studio-workspace">
            <div className="signal-board-studio-toolbar">
                <div><p className="signal-board-panel-kicker">Studio Board</p>
                    <span>{cloudStatus}</span></div>
                <div className="signal-board-command-actions">
                    <button type="button" onClick={handleReloadCloudBoard}>
                        Reload
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveToCloud}
                        disabled={isSaving || !releaseWorldId}
                    >
                        {isSaving ? "Saving..." : "Save Board"}
                    </button>
                </div>
            </div>
            <p className="signal-board-workspace-status" role="status">{cloudMessage}</p>
            <details className="signal-board-workspace-disclosure">
                <summary>Board overview</summary>
                <aside className="signal-board-coverage" aria-label="Signal map and board coverage">
                    <div className="signal-board-coverage-copy">
                        <p className="signal-board-panel-kicker">Board Overview</p>
                        <h3>Signal map</h3>
                        <span>See where the world is developed and where the board still feels thin.</span>
                    </div>
                    <div className="signal-board-coverage-stats">
                        <div><span>Cards</span><strong>{artifacts.length}</strong></div>
                        <div><span>Public</span><strong>{artifacts.filter((artifact) => artifact.isPublic).length}</strong></div>
                        <div><span>Tracks</span><strong>{releaseTracks.length}</strong></div>
                        <div><span>Nexus live</span><strong>{releaseTracks.filter((track) => track.showInNexus).length}</strong></div>
                    </div>
                    <div className="signal-board-theme-map signal-board-coverage-map">
                        {hookCounts.map((target) => (
                            <div key={target.slug}>
                                <span>{target.title}</span>
                                <strong>{target.count}</strong>
                            </div>
                        ))}
                    </div>
                </aside>

            </details>
            <section
                className="signal-board-canvas-zone"
                aria-label="Main interactive board stage"
            >
                <div
                    className="signal-board-frame-scroll"
                    aria-label="Scrollable board area"
                >
                    <section
                        ref={boardRef}
                        className="signal-board-frame signal-board-frame-compact"
                        aria-label={`${releaseTitle} signal board`}
                    >
                        <div className="signal-board-frame-glow" />
                        <div className="signal-board-texture" />
                        <div className="signal-board-thread signal-board-thread-a" />
                        <div className="signal-board-thread signal-board-thread-b" />
                        <div className="signal-board-thread signal-board-thread-c" />
                        <div className="signal-board-thread signal-board-thread-d" />
                        <div className="signal-board-thread signal-board-thread-e" />

                        {artifacts.map((artifact) => (
                            <BoardArtifactCard
                                key={artifact.id}
                                artifact={artifact}
                                isSelected={artifact.id === selectedArtifactId}
                                onPointerDown={handleArtifactPointerDown}
                                onDelete={deleteArtifact}
                                onLayerNudge={nudgeLayer}
                            />
                        ))}
                    </section>
                </div>

                {selectedArtifact && (
                    <div
                        className="signal-board-inspector-bar"
                        aria-label="Selected artifact inspector"
                    >
                        <div>
                            <p className="signal-board-panel-kicker">Selected Artifact</p>
                            <strong>{selectedArtifact.title}</strong>
                            <span>{selectedArtifact.eyebrow || selectedArtifact.kind}</span>
                        </div>

                        <label>
                            Color
                            <select
                                value={selectedArtifact.color ?? "cream"}
                                onChange={(event) =>
                                    updateArtifact(selectedArtifact.id, {
                                        color: event.target.value as ArtifactColor,
                                    })
                                }
                            >
                                {colorOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Size
                            <select
                                value={selectedArtifact.size ?? "md"}
                                onChange={(event) =>
                                    updateArtifact(selectedArtifact.id, {
                                        size: event.target.value as ArtifactSize,
                                    })
                                }
                            >
                                {sizeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Layer
                            <select
                                value={selectedArtifact.layer ?? 4}
                                onChange={(event) =>
                                    updateArtifact(selectedArtifact.id, {
                                        layer: Number(event.target.value),
                                    })
                                }
                            >
                                {layerOptions.map((layer) => (
                                    <option key={layer} value={layer}>
                                        {layer}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <details className="signal-board-workspace-disclosure signal-board-artifact-publication">
                            <summary>Release page placement</summary>
                            <div className="signal-board-artifact-publication-fields">
                                <label className="signal-board-public-toggle">
                                    Publish to Portal
                                    <button
                                        type="button"
                                        className={selectedArtifact.isPublic ? "is-active" : ""}
                                        onClick={() =>
                                            updateArtifact(selectedArtifact.id, {
                                                isPublic: !selectedArtifact.isPublic,
                                            })
                                        }
                                    >
                                        {selectedArtifact.isPublic ? "Showing" : "Hidden"}
                                    </button>
                                    <span className="signal-board-field-note">
                                        Showing publishes this card as a World Fragment on the Release Page.
                                    </span>
                                </label>

                                <label>
                                    Section
                                    <select
                                        value={selectedArtifact.pageSection ?? "story"}
                                        onChange={(event) =>
                                            updateArtifact(selectedArtifact.id, {
                                                pageSection: event.target.value,
                                            })
                                        }
                                    >
                                        {pageSectionOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Order
                                    <select
                                        value={selectedArtifact.pageOrder ?? 1}
                                        onChange={(event) =>
                                            updateArtifact(selectedArtifact.id, {
                                                pageOrder: Number(event.target.value),
                                            })
                                        }
                                    >
                                        {Array.from({ length: 12 }, (_, index) => index + 1).map((order) => (
                                            <option key={order} value={order}>
                                                {order}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </details>
                    </div>
                )}
            </section>

            <section className="signal-board-panel-section signal-board-create-panel">
                <div className="signal-board-panel-heading">
                    <div>
                        <p className="signal-board-panel-kicker">Create + Style</p>
                        <h2>Build a signal card</h2>
                        <p>Write the idea, choose how it should feel, then add exactly that card to the board.</p>
                    </div>
                    <button type="button" onClick={resetBoard}>Reset Starter Board</button>
                </div>

                <div className="signal-board-create-layout">
                    <div className="signal-board-create-compose">
                        <div className="signal-board-create-mode" role="tablist" aria-label="Signal card type">
                            <button type="button" className={createMode === "hook" ? "is-active" : ""} onClick={() => setCreateMode("hook")}>Hook</button>
                            <button type="button" className={createMode === "note" ? "is-active" : ""} onClick={() => setCreateMode("note")}>Note</button>
                        </div>

                        {createMode === "hook" ? (
                            <div className="signal-board-toolbox-card signal-board-toolbox-card-flat signal-board-create-form">
                                <p className="signal-board-panel-kicker">Hook Lab</p>
                                <h2>Add hook artifact</h2>
                                <label>Attach to
                                    <select value={selectedTrackSlug} onChange={(event) => setSelectedTrackSlug(event.target.value)}>
                                        {hookTargetOptions.map((target) => (<option key={target.slug} value={target.slug}>{target.title}</option>))}
                                    </select>
                                </label>
                                <label>Title<input value={hookTitle} onChange={(event) => setHookTitle(event.target.value)} placeholder="Short hook title" /></label>
                                <label>Signal<textarea value={hookDescription} onChange={(event) => setHookDescription(event.target.value)} placeholder="Hook, phrase, theme, or lyric..." rows={3} /></label>
                                <button type="button" onClick={addHook}>Add Hook</button>
                            </div>
                        ) : (
                            <div className="signal-board-toolbox-card signal-board-toolbox-card-flat signal-board-create-form">
                                <p className="signal-board-panel-kicker">Artifact Drop</p>
                                <h2>Add custom note</h2>
                                <label>Tag<input value={noteTag} onChange={(event) => setNoteTag(event.target.value)} placeholder="Visual idea, symbol, rollout..." /></label>
                                <label>Title<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Short artifact title" /></label>
                                <label>Note<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="Idea, symbol, clip thought, or reminder..." rows={3} /></label>
                                <button type="button" onClick={addNoteArtifact}>Add Note</button>
                            </div>
                        )}
                    </div>

                    <aside className="signal-board-create-style">
                        <div className={`signal-board-card-preview signal-board-pin-color-${selectedColor} signal-board-card-preview-${selectedSize}`}>
                            <span>{createMode === "hook" ? "Hook" : noteTag || "Note"}</span>
                            <strong>{createMode === "hook" ? hookTitle || "Your next hook" : noteTitle || "Your next note"}</strong>
                            <p>{createMode === "hook" ? hookDescription || `Attached to ${getHookTargetTitle(selectedTrackSlug, hookTargetOptions)}` : noteBody || "Add the idea, visual, or reminder."}</p>
                            <em>{sizeOptions.find((option) => option.value === selectedSize)?.label} • Layer {selectedLayer}</em>
                        </div>

                        <div className="signal-board-toolbox-card signal-board-toolbox-card-flat">
                            <p className="signal-board-panel-kicker">Card Appearance</p>
                            <h2>Style before you drop</h2>
                            <div className="signal-board-style-row" aria-label="New card color">
                                {colorOptions.map((option) => (
                                    <button key={option.value} type="button" className={`signal-board-swatch signal-board-swatch-${option.value} ${selectedColor === option.value ? "is-active" : ""}`} onClick={() => setSelectedColor(option.value)}>{option.label}</button>
                                ))}
                            </div>
                            <div className="signal-board-size-row" aria-label="New card size">
                                {sizeOptions.map((option) => (
                                    <button key={option.value} type="button" className={selectedSize === option.value ? "is-active" : ""} onClick={() => setSelectedSize(option.value)}>{option.label}</button>
                                ))}
                            </div>
                            <label>Layer priority
                                <select value={selectedLayer} onChange={(event) => setSelectedLayer(Number(event.target.value))}>
                                    {layerOptions.map((layer) => (<option key={layer} value={layer}>Layer {layer}</option>))}
                                </select>
                            </label>
                        </div>

                        <details className="signal-board-style-disclosure">
                            <summary>Starter board theme</summary>
                            <div className="signal-board-style-disclosure-body">
                                <div className="signal-board-style-row" aria-label="Starter board color">
                                    {colorOptions.map((option) => (
                                        <button key={option.value} type="button" className={`signal-board-swatch signal-board-swatch-${option.value} ${boardColor === option.value ? "is-active" : ""}`} onClick={() => applyStarterBoardColor(option.value)}>{option.label}</button>
                                    ))}
                                </div>
                                <p className="signal-board-tool-note">Generated starter cards only.</p>
                            </div>
                        </details>
                    </aside>
                </div>
            </section>
        </div>
    );
}
