"use client";

import { usePlatformAccess } from "@/context/PlatformAccessProvider";
import { useCreatorView } from "@/context/CreatorViewProvider";

export default function CreatorModeSwitch({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { canAccessCreatorOS, loading } = usePlatformAccess();
    const { viewMode, setViewMode } = useCreatorView();

    if (loading || !canAccessCreatorOS) return null;

    return (
        <div
            className={`inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] p-1 ${
                compact ? "gap-0.5" : "gap-1"
            }`}
            aria-label="Creator view mode"
        >
            <button
                type="button"
                onClick={() => setViewMode("creator")}
                aria-pressed={viewMode === "creator"}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    viewMode === "creator"
                        ? "bg-[#DCBA5C] text-[#080A10]"
                        : "text-white/55 hover:text-white"
                }`}
            >
                Creator
            </button>

            <button
                type="button"
                onClick={() => setViewMode("public-preview")}
                aria-pressed={viewMode === "public-preview"}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    viewMode === "public-preview"
                        ? "bg-[#7ED3FF] text-[#071018]"
                        : "text-white/55 hover:text-white"
                }`}
            >
                {compact ? "Preview" : "Public Preview"}
            </button>
        </div>
    );
}
