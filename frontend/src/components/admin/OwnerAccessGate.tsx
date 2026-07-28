"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";

export default function OwnerAccessGate({
    children,
}: {
    children: ReactNode;
}) {
    const {
        isAuthenticated,
        canAccessOwnerTools,
        loading,
        errorMessage,
    } = usePlatformAccess();

    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-sm text-white/55">
                    Verifying owner authority…
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.035] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-100/70">
                    Owner Access Check Failed
                </p>
                <p className="mt-2 text-sm text-white/60">
                    {errorMessage}
                </p>
            </div>
        );
    }

    if (!isAuthenticated || !canAccessOwnerTools) {
        return (
            <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.035] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100/70">
                    Owner Tools
                </p>
                <p className="mt-2 text-sm text-white/60">
                    Platform role management is restricted to owners.
                </p>
                {!isAuthenticated ? (
                    <Link
                        href="/api/auth/signin"
                        className="mt-4 inline-flex text-sm font-medium text-[#F4D982] hover:text-[#FFEAA7]"
                    >
                        Sign in
                    </Link>
                ) : null}
            </div>
        );
    }

    return children;
}
