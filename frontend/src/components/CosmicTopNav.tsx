"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const navItems = [
  { href: "/", label: "Home", description: "Landing page" },
  { href: "/nexus", label: "Nexus", description: "Music portal" },
  { href: "/find-your-realm", label: "Align", description: "Find your realm" },
  { href: "/leaderboard", label: "Rank", description: "Traveler rankings" },
  { href: "/profile", label: "Profile", description: "Progress dashboard" },
];

export default function CosmicTopNav({ title }: { title?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#DCBA5C]/40 hover:text-[#DCBA5C]"
          >
            <span className="text-lg leading-none">{isOpen ? "×" : "☰"}</span>
          </button>

          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.28em] text-white"
            onClick={() => setIsOpen(false)}
          >
            COSMIC
          </Link>

          {isOpen && (
            <div className="absolute left-0 top-14 w-[min(88vw,320px)] overflow-hidden rounded-2xl border border-white/10 bg-[#090D17]/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#DCBA5C]/80">
                  Navigation
                </p>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-xl px-3 py-3 transition ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium tracking-[0.12em] uppercase">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs text-white/45">
                            {item.description}
                          </p>
                        </div>

                        <span className="text-white/35">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {title && (
          <h1 className="hidden text-sm font-medium tracking-[0.14em] text-white/70 sm:block">
            {title}
          </h1>
        )}

        <Link
          href="/profile"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-white/75 transition hover:border-white/30 hover:text-white"
        >
          <UserCircleIcon className="h-7 w-7" />
        </Link>
      </div>
    </header>
  );
}