export type SavedExperiment = { id: string; title: string; note: string; provenance: string; createdAt: string; updatedAt: string; slots: { index: number; trackId: string | null; available: boolean }[] };
export type ExperimentSave = (input: { id?: string; title: string; note: string; trackIds: string[] }) => Promise<SavedExperiment>;
export type ExperimentMemory = { experiments?: SavedExperiment[]; onSaveExperiment?: ExperimentSave; onDeleteExperiment?: (id: string) => Promise<void> };
export function experimentDraft(experiment: SavedExperiment) { return experiment.slots.map(slot => slot.available && slot.trackId ? slot.trackId : `unavailable:${slot.index}`); }
