"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function CosmicTopNav({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="cosmic-top-nav">
      <div className="cosmic-top-nav-inner">
        <Link href="/nexus" className="cosmic-brand">
          <span className="cosmic-brand-mark">✦</span>
          <span className="cosmic-brand-text">COSMIC</span>
        </Link>

        {title && (
          <h1 className="cosmic-page-title">
            {title}
          </h1>
        )}

        <div className="cosmic-nav-actions">
          {session?.user?.email && (
            <button
              type="button"
              onClick={() => signOut()}
              className="cosmic-signout"
            >
              Sign out
            </button>
          )}

          <Link href="/profile" className="cosmic-profile-link" aria-label="Open profile">
            <UserCircleIcon className="w-7 h-7" />
          </Link>
        </div>
      </div>
    </header>
  );
}