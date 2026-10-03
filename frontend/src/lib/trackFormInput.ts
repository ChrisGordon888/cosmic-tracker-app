import type { TrackForm } from "@/components/signal-board/types";

export function getTrackInputFromForm(form: TrackForm) {
    const bpmValue = form.bpm.trim() ? Number(form.bpm) : null;

    return {
        title: form.title.trim(),
        trackNumber: form.trackNumber.trim() ? Number(form.trackNumber) : undefined,
        role: form.role,
        status: form.status,
        bpm: Number.isFinite(bpmValue) ? bpmValue : null,
        keySignature: form.keySignature.trim(),
        mood: form.mood.trim(),
        hook: form.hook.trim(),
        notes: form.notes.trim(),
        audioUrl: form.audioUrl.trim(),
        previewAudioUrl: form.previewAudioUrl.trim(),
        platformUrl: form.platformUrl.trim(),
        visibility: form.visibility,
        playbackStatus: form.playbackStatus,
        dropDate: form.dropDate || null,
        unlockDate: form.unlockDate || null,
        isFocusTrack: form.isFocusTrack,
        isSecondFocus: form.isSecondFocus,
        isPublic: form.visibility === "public" || form.visibility === "listed",
        realmId: form.realmId === "" ? null : Number(form.realmId),
        nexusSortOrder: form.nexusSortOrder.trim() ? Number(form.nexusSortOrder) : 999,
        realmFinderSuggestedRealmId:
            form.realmFinderSuggestedRealmId === "" ? null : Number(form.realmFinderSuggestedRealmId),
        realmFinderSecondaryRealmId:
            form.realmFinderSecondaryRealmId === "" ? null : Number(form.realmFinderSecondaryRealmId),
        realmFinderTraceRealmId:
            form.realmFinderTraceRealmId === "" ? null : Number(form.realmFinderTraceRealmId),
        realmFinderAlignment:
            form.realmFinderAlignment === "" ? null : Number(form.realmFinderAlignment),
        realmFinderSignals: form.realmFinderSignals,
        realmFinderSummary: form.realmFinderSummary.trim(),
        realmFinderDominantSignal: form.realmFinderDominantSignal.trim(),
        realmFinderExplanation: form.realmFinderExplanation.trim(),
        realmFinderScores: form.realmFinderScores ? Object.fromEntries(
            ["realm303", "realm202", "realm101", "realm55", "realm44", "realm0"].map(key => [key, form.realmFinderScores?.[key as keyof NonNullable<TrackForm["realmFinderScores"]>] ?? 0])
        ) : null,
        realmFinderVersion: form.realmFinderVersion.trim(),
    };
}

export function getTrackUpdateFromForms(form: TrackForm, saved: TrackForm) {
    const next = getTrackInputFromForm(form);
    const previous = getTrackInputFromForm(saved);
    return Object.fromEntries(Object.entries(next).filter(([key, value]) =>
        JSON.stringify(value) !== JSON.stringify(previous[key as keyof typeof previous])
    ));
}
