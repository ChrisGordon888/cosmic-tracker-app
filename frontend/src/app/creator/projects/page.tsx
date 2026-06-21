"use client";

import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { signIn, useSession } from "next-auth/react";
import "@/styles/creatorProjects.css";

const MY_RELEASE_WORLDS = gql`
  query MyReleaseWorlds {
    myReleaseWorlds {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      updatedAt
      lastOpenedAt
    }
  }
`;

type ReleaseWorld = {
  id: string;
  title: string;
  slug: string;
  releaseType: string;
  status: string;
  visibility: string;
  isFeatured: boolean;
  updatedAt?: string | null;
  lastOpenedAt?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Not opened yet";

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLabel(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CreatorProjectsPage() {
  const { status } = useSession();

  const { data, loading, error, refetch } = useQuery(MY_RELEASE_WORLDS, {
    skip: status !== "authenticated",
    fetchPolicy: "cache-and-network",
  });

  const releaseWorlds: ReleaseWorld[] = data?.myReleaseWorlds ?? [];

  return (
    <main className="creator-projects-page">
      <section className="creator-projects-shell">
        <div className="creator-projects-hero">
          <div>
            <p className="creator-projects-kicker">Creator Console</p>
            <h1>Project Library</h1>
            <p className="creator-projects-subtitle">
              Your release worlds, signal boards, campaign portals, and creative
              systems will live here as real Mongo-backed projects.
            </p>
          </div>

          <div className="creator-projects-hero-actions">
            <Link href="/creator" className="creator-projects-ghost-button">
              Creator Home
            </Link>
            <Link href="/nexus" className="creator-projects-ghost-button">
              Nexus
            </Link>
          </div>
        </div>

        <div className="creator-projects-status-strip">
          <div>
            <span className="creator-projects-status-label">Backend</span>
            <strong>MongoDB + GraphQL</strong>
          </div>
          <div>
            <span className="creator-projects-status-label">Current view</span>
            <strong>{releaseWorlds.length} release world{releaseWorlds.length === 1 ? "" : "s"}</strong>
          </div>
          <div>
            <span className="creator-projects-status-label">Auth</span>
            <strong>{status === "authenticated" ? "Signed in" : "Not signed in"}</strong>
          </div>
        </div>

        {status === "loading" && (
          <section className="creator-projects-card creator-projects-message-card">
            <p className="creator-projects-kicker">Loading Session</p>
            <h2>Checking your creator access...</h2>
          </section>
        )}

        {status === "unauthenticated" && (
          <section className="creator-projects-card creator-projects-message-card">
            <p className="creator-projects-kicker">Sign In Required</p>
            <h2>Connect your local session to view saved projects.</h2>
            <p>
              The backend data exists, but this frontend page needs a signed-in
              NextAuth session so Apollo can send your Authorization token.
            </p>
            <button
              className="creator-projects-primary-button"
              type="button"
              onClick={() => signIn("github")}
            >
              Sign in with GitHub
            </button>
          </section>
        )}

        {status === "authenticated" && loading && (
          <section className="creator-projects-grid">
            <article className="creator-projects-card creator-projects-loading-card">
              <p className="creator-projects-kicker">Loading</p>
              <h2>Pulling your release worlds...</h2>
              <p>Reading from the GraphQL creator-world resolver.</p>
            </article>
          </section>
        )}

        {status === "authenticated" && error && (
          <section className="creator-projects-card creator-projects-message-card creator-projects-error-card">
            <p className="creator-projects-kicker">GraphQL Error</p>
            <h2>Could not load projects yet.</h2>
            <p>{error.message}</p>
            <button
              className="creator-projects-primary-button"
              type="button"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </section>
        )}

        {status === "authenticated" && !loading && !error && releaseWorlds.length === 0 && (
          <section className="creator-projects-card creator-projects-message-card">
            <p className="creator-projects-kicker">Empty Library</p>
            <h2>No release worlds found yet.</h2>
            <p>
              Your backend is connected, but this account does not have saved
              release worlds yet. Once you create one, it will appear here.
            </p>
          </section>
        )}

        {status === "authenticated" && !error && releaseWorlds.length > 0 && (
          <section className="creator-projects-grid">
            {releaseWorlds.map((world) => (
              <article className="creator-projects-card creator-project-card" key={world.id}>
                <div className="creator-project-card-topline">
                  <span>{formatLabel(world.releaseType)}</span>
                  {world.isFeatured && <span>Featured</span>}
                </div>

                <h2>{world.title}</h2>

                <p className="creator-project-card-slug">/{world.slug}</p>

                <div className="creator-project-card-meta">
                  <div>
                    <span>Status</span>
                    <strong>{formatLabel(world.status)}</strong>
                  </div>
                  <div>
                    <span>Visibility</span>
                    <strong>{formatLabel(world.visibility)}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{formatDate(world.updatedAt)}</strong>
                  </div>
                  <div>
                    <span>Last opened</span>
                    <strong>{formatDate(world.lastOpenedAt)}</strong>
                  </div>
                </div>

                <div className="creator-project-card-actions">
                  <Link
                    href={`/releases/${world.slug}`}
                    className="creator-projects-primary-button"
                  >
                    Open Release Page
                  </Link>
                  <Link
                    href={`/releases/${world.slug}/board`}
                    className="creator-projects-secondary-button"
                  >
                    Open Signal Board
                  </Link>
                </div>

                <p className="creator-project-card-id">ReleaseWorld ID: {world.id}</p>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}