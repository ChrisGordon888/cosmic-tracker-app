"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import "@/styles/authPage.css";
import '@/styles/nexus.css';

export default function AuthPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="cosmic-auth-page min-h-screen">
      <div className="cosmic-auth-orb" />

      <section className="cosmic-auth-card">
        <div className="cosmic-auth-mark">✦</div>

        <p className="cosmic-auth-kicker">Cosmic Access</p>

        <h1>
          Enter the
          <span>Multiverse</span>
        </h1>

        <p className="cosmic-auth-copy">
          Sign in to save realm progress, XP, music history, trial completion,
          and your traveler profile.
        </p>

        <div className="cosmic-auth-actions">
          {isAuthenticated ? (
            <Link href="/nexus" className="cosmic-auth-primary">
              Continue to Nexus
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/nexus" })}
              className="cosmic-auth-primary"
            >
              Sign in with GitHub
            </button>
          )}

          <Link href="/" className="cosmic-auth-secondary">
            Return Home
          </Link>
        </div>

        <div className="cosmic-auth-system-line">
          <span>Progress Saved</span>
          <span>Music XP</span>
          <span>Realm Path</span>
        </div>
      </section>
    </main>
  );
}