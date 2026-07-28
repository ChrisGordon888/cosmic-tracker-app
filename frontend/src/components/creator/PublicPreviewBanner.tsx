"use client";

import { usePathname } from "next/navigation";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";
import { useCreatorView } from "@/context/CreatorViewProvider";
import { supportsCreatorViewMode } from "@/lib/creatorViewRoutes";

export default function PublicPreviewBanner() {
    const pathname = usePathname();
    const { canAccessCreatorOS } = usePlatformAccess();
    const { isPublicPreview, setViewMode } = useCreatorView();
    const supportsViewMode = supportsCreatorViewMode(pathname);

    if (!canAccessCreatorOS || !isPublicPreview || !supportsViewMode) return null;

    return (
        <div className="sticky top-16 z-40 border-b border-[#7ED3FF]/25 bg-[#07131D]/95 px-4 py-2 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <p className="text-xs text-white/75">
                    <strong className="mr-2 uppercase tracking-[0.15em] text-[#7ED3FF]">Public Preview</strong>
                    You are simulating the listener-facing experience while remaining signed in.
                </p>
                <button type="button" onClick={() => setViewMode("creator")} className="shrink-0 rounded-full border border-[#7ED3FF]/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BCEAFF] transition hover:bg-[#7ED3FF]/10">
                    Return to Creator
                </button>
            </div>
        </div>
    );
}
