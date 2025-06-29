"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="text-sm text-gray-500">Loading session...</p>;

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Signed in as {session.user?.email}
        </p>
        <button
          onClick={() => signOut()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded transition"
    >
      Sign In
    </button>
  );
}