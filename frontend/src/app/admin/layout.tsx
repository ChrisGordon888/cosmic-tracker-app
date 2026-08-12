"use client";

import AdminAccessGate from "@/components/admin/AdminAccessGate";
import { usePlatformAccess } from "@/context/PlatformAccessProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function navClass(active: boolean) {
  return active
    ? "rounded-full border border-[#DCBA5C]/30 bg-[#DCBA5C]/10 px-4 py-2 text-[#F4D982] transition"
    : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/65 transition hover:bg-white/10 hover:text-white";
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { canAccessOwnerTools } = usePlatformAccess();

  const usersActive = pathname === "/admin";
  const reviewActive = pathname === "/admin/nexus";
  const editorialActive = pathname.startsWith("/admin/nexus/editorial");

  return (
    <AdminAccessGate>
      <div className="min-h-screen bg-[#05070D] text-white">
        <header className="border-b border-white/10 bg-[#090D17]/85 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#DCBA5C]/80">Cosmic Platform</p>
              <h1 className="mt-1 text-lg font-semibold">Authority Console</h1>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/admin" className={navClass(usersActive)}>Users</Link>
              <Link href="/creator" className={navClass(false)}>Creator OS</Link>
              <Link href="/admin/nexus" className={navClass(reviewActive)}>Nexus Review</Link>
              {canAccessOwnerTools && <Link href="/admin/nexus/editorial" className={navClass(editorialActive)}>Nexus Editorial</Link>}
            </nav>
          </div>
        </header>
        {children}
      </div>
    </AdminAccessGate>
  );
}
