"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import "@/styles/authPage.css";
import "@/styles/nexus.css";

function getCallbackUrl() {
  if (typeof window === "undefined") return "/nexus";

  const requested = new URLSearchParams(window.location.search).get("callbackUrl");

  // Keep redirects inside this application. OAuth callback URLs should never
  // turn this page into an open redirect.
  if (requested?.startsWith("/") && !requested.startsWith("//")) {
    return requested;
  }

  return "/nexus";
}

export default function AuthPage() {
  const { data: session, status } = useSession();
  const [callbackUrl, setCallbackUrl] = useState("/nexus");
  const isAuthenticated = Boolean(session?.user);
  const isLoading = status === "loading";

  useEffect(() => {
    setCallbackUrl(getCallbackUrl());
  }, []);

  const handleProviderSignIn = (provider: "google" | "github") => {
    void signIn(provider, { callbackUrl: getCallbackUrl() });
  };

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
          Sign in to save realm progress, build your creator world, and carry
          your Cosmic identity across Nexus and Creator OS.
        </p>

        <div className="cosmic-auth-actions">
          {isAuthenticated ? (
            <Link href={callbackUrl} className="cosmic-auth-primary">
              Continue to Cosmic
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleProviderSignIn("google")}
                className="cosmic-auth-primary"
                disabled={isLoading}
              >
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleProviderSignIn("github")}
                className="cosmic-auth-secondary"
                disabled={isLoading}
              >
                Continue with GitHub
              </button>
            </>
          )}

          <Link href="/" className="cosmic-auth-secondary">
            Return Home
          </Link>
        </div>

        <div className="cosmic-auth-system-line">
          <span>Progress Saved</span>
          <span>Creator Ready</span>
          <span>Realm Path</span>
        </div>
      </section>
    </main>
  );
}
