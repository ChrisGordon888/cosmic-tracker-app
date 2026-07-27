"use client";

import CreatorAccessGate from "@/components/creator/CreatorAccessGate";
import CreatorModeSwitch from "@/components/creator/CreatorModeSwitch";

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CreatorAccessGate>
            <div className="border-b border-white/10 bg-[#090D17]/75 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#DCBA5C]/80">
                            Creator Workspace
                        </p>
                        <p className="text-xs text-white/45">
                            Build privately or inspect the public-facing view.
                        </p>
                    </div>

                    <CreatorModeSwitch />
                </div>
            </div>

            {children}
        </CreatorAccessGate>
    );
}
