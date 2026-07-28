"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";

export default function AdminAccessGate({
    children,
}: {
    children: ReactNode;
}) {
    const {
        isAuthenticated,
        canAccessAdmin,
        loading,
        errorMessage,
    } = usePlatformAccess();

    if (loading) {
        return (
            <main className="min-h-[70vh] px-4 py-16">
                <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#DCBA5C]/75">
                        Platform Authority
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-white">
                        Verifying administrative access…
                    </h1>
                </div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-[70vh] px-4 py-16">
                <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#DCBA5C]/75">
                        Restricted Area
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-white">
                        Sign in to continue
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        Administrative tools require an authenticated platform account.
                    </p>
                    <Link
                        href="/api/auth/signin"
                        className="mt-6 inline-flex rounded-full border border-[#DCBA5C]/35 bg-[#DCBA5C]/10 px-5 py-2.5 text-sm font-medium text-[#F4D982] transition hover:bg-[#DCBA5C]/20"
                    >
                        Sign in
                    </Link>
                </div>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="min-h-[70vh] px-4 py-16">
                <div className="mx-auto max-w-xl rounded-3xl border border-rose-300/15 bg-rose-300/[0.035] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-200/75">
                        Access Check Failed
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-white">
                        We could not verify platform authority
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        {errorMessage}
                    </p>
                </div>
            </main>
        );
    }

    if (!canAccessAdmin) {
        return (
            <main className="min-h-[70vh] px-4 py-16">
                <div className="mx-auto max-w-xl rounded-3xl border border-rose-300/15 bg-rose-300/[0.035] p-8 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-200/75">
                        Access Denied
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-white">
                        Administrator access required
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        Your database account does not currently have administrator or owner authority.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
                    >
                        Return home
                    </Link>
                </div>
            </main>
        );
    }

    return children;
}
