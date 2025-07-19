"use client";

import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function CosmicTopNav({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Left: Cosmic Home */}
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          Cosmic 🌙
        </Link>

        {/* Center: Optional Page Title */}
        {title && (
          <h1 className="hidden sm:block text-base font-medium text-gray-800 dark:text-gray-200">
            {title}
          </h1>
        )}

        {/* Right: Profile Icon */}
        <div className="flex items-center">
          <Link href="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            <UserCircleIcon className="w-7 h-7 text-gray-700 dark:text-gray-300" />
          </Link>
        </div>
      </div>
    </header>
  );
}