"use client";

import CreatorAccessGate from "@/components/creator/CreatorAccessGate";

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CreatorAccessGate>
            <div className="border-b border-white/10 bg-[#090D17]/75 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#DCBA5C]/80">
                        Creator Workspace
                    </p>
                    <p className="text-xs text-white/45">
                        Build and manage your private creative world.
                    </p>
                </div>
            </div>

            {children}
        </CreatorAccessGate>
    );
}