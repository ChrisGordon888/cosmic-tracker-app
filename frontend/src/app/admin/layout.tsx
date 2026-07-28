"use client";

import AdminAccessGate from "@/components/admin/AdminAccessGate";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <AdminAccessGate>
            <div className="min-h-screen bg-[#05070D] text-white">
                <header className="border-b border-white/10 bg-[#090D17]/85 px-4 py-4 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-[#DCBA5C]/80">
                                Cosmic Platform
                            </p>
                            <h1 className="mt-1 text-lg font-semibold">
                                Authority Console
                            </h1>
                        </div>

                        <nav className="flex items-center gap-2 text-sm">
                            <Link
                                href="/admin"
                                className="rounded-full border border-[#DCBA5C]/25 bg-[#DCBA5C]/10 px-4 py-2 text-[#F4D982] transition hover:bg-[#DCBA5C]/15"
                            >
                                Users
                            </Link>
                            <Link
                                href="/creator"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                Creator OS
                            </Link>
                        </nav>
                    </div>
                </header>

                {children}
            </div>
        </AdminAccessGate>
    );
}