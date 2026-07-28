"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

type SessionAccessUser = {
    role?: string | null;
};

export default function OwnerAccessGate({
    children,
}: {
    children: ReactNode;
}) {
    const { data: session, status } = useSession();
    const accessUser = session?.user as SessionAccessUser | undefined;
    const isOwner = accessUser?.role === "owner";

    if (status === "loading") {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-sm text-white/55">
                    Verifying owner authority…
                </p>
            </div>
        );
    }

    if (!session || !isOwner) {
        return (
            <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.035] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100/70">
                    Owner Tools
                </p>
                <p className="mt-2 text-sm text-white/60">
                    Platform role management is restricted to owners.
                </p>
                {!session ? (
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
