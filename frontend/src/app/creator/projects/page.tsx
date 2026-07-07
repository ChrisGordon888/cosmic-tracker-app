"use client";

import Link from "next/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";
import "@/styles/creatorProjects.css";

const MY_CREATIVE_PROFILES = gql`
  query MyCreativeProfiles {
    myCreativeProfiles {
      id
      artistName
      slug
      displayName
      isPublic
      isFeatured
    }
  }
`;

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
      oneLineSummary
      story
      fullDropDate
      coverArtUrl
      coverAssetId
      currentFocus
      secondFocus
      updatedAt
      lastOpenedAt
    }
  }
`;

const CREATE_RELEASE_WORLD = gql`
  mutation CreateReleaseWorld($input: ReleaseWorldInput!) {
    createReleaseWorld(input: $input) {
      id
      title
      slug
      releaseType
      status
      visibility
      isFeatured
      oneLineSummary
      story
      fullDropDate
      coverArtUrl
      coverAssetId
      currentFocus
      secondFocus
      updatedAt
      lastOpenedAt
    }
  }
`;

type CreativeProfile = {
  id: string;
  artistName: string;
  slug: string;
  displayName?: string | null;
  isPublic: boolean;
  isFeatured: boolean;
};

type ReleaseWorld = {
  id: string;
  title: string;
  slug: string;
  releaseType: string;
  status: string;
  visibility: string;
  isFeatured: boolean;
  oneLineSummary?: string | null;
  story?: string | null;
  fullDropDate?: string | null;
  coverArtUrl?: string | null;
  coverAssetId?: string | null;
  currentFocus?: string | null;
  secondFocus?: string | null;
  updatedAt?: string | null;
  lastOpenedAt?: string | null;
};

type NewProjectForm = {
  title: string;
  slug: string;
  releaseType: string;
  status: string;
  visibility: string;
  oneLineSummary: string;
  story: string;
  currentFocus: string;
  secondFocus: string;
  fullDropDate: string;
};

const initialForm: NewProjectForm = {
  title: "",
  slug: "",
  releaseType: "ep",
  status: "draft",
  visibility: "private",
  oneLineSummary: "",
  story: "",
  currentFocus: "",
  secondFocus: "",
  fullDropDate: "",
};

function getCalendarDateParts(value?: string | null) {
  if (!value) return null;

  const cleanValue = String(value).trim();
  const datePrefixMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (datePrefixMatch) {
    const [, year, month, day] = datePrefixMatch;
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    };
  }

  const numericValue = Number(cleanValue);
  const parsedDate = Number.isFinite(numericValue)
    ? new Date(numericValue)
    : new Date(cleanValue);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return {
    year: parsedDate.getUTCFullYear(),
    month: parsedDate.getUTCMonth() + 1,
    day: parsedDate.getUTCDate(),
  };
}

function formatDate(value?: string | null) {
  const dateParts = getCalendarDateParts(value);

  if (!dateParts) return "Not opened yet";

  const localCalendarDate = new Date(dateParts.year, dateParts.month - 1, dateParts.day);

  if (Number.isNaN(localCalendarDate.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(localCalendarDate);
}

function formatLabel(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ReadinessItem = {
  label: string;
  isComplete: boolean;
  hint: string;
};

function getReadinessItems(world: ReleaseWorld): ReadinessItem[] {
  return [
    {
      label: "Portal public",
      isComplete: world.visibility === "public",
      hint: world.visibility === "public" ? "Public release page can be shared." : "Set release visibility to Public in the Signal Board.",
    },
    {
      label: "Cover art",
      isComplete: Boolean(world.coverArtUrl?.trim()),
      hint: world.coverArtUrl?.trim() ? "Artwork is attached." : "Add cover art in the Signal Board assets.",
    },
    {
      label: "Story",
      isComplete: Boolean(world.story?.trim() || world.oneLineSummary?.trim()),
      hint: world.story?.trim() ? "Story is ready for the portal." : "Add a stronger release story or summary.",
    },
    {
      label: "Drop date",
      isComplete: Boolean(world.fullDropDate),
      hint: world.fullDropDate ? `World opens ${formatDate(world.fullDropDate)}.` : "Set the release drop date.",
    },
    {
      label: "Focus signals",
      isComplete: Boolean(world.currentFocus?.trim() || world.secondFocus?.trim()),
      hint: world.currentFocus?.trim() || world.secondFocus?.trim() ? "Lead/contrast signals are named." : "Name a lead signal or second signal.",
    },
    {
      label: "Nexus feature",
      isComplete: Boolean(world.isFeatured),
      hint: world.isFeatured ? "Eligible as the Nexus front-door feature." : "Feature this when the portal is ready.",
    },
  ];
}

function getReadinessScore(world: ReleaseWorld) {
  const items = getReadinessItems(world);
  const completeCount = items.filter((item) => item.isComplete).length;
  const percent = Math.round((completeCount / items.length) * 100);

  return {
    items,
    completeCount,
    totalCount: items.length,
    percent,
    label:
      percent >= 85
        ? "Ready for soft share"
        : percent >= 55
          ? "Close to shareable"
          : "Needs setup",
  };
}

function getProjectTypeCopy(world: ReleaseWorld) {
  const releaseType = formatLabel(world.releaseType);
  const status = formatLabel(world.status);
  const visibility = formatLabel(world.visibility);

  return `${releaseType} • ${status} • ${visibility}`;
}

export default function CreatorProjectsPage() {
  const { status } = useSession();
  const [form, setForm] = useState<NewProjectForm>(initialForm);
  const [formMessage, setFormMessage] = useState("");

  const {
    data: profileData,
    loading: profilesLoading,
    error: profilesError,
  } = useQuery(MY_CREATIVE_PROFILES, {
    skip: status !== "authenticated",
    fetchPolicy: "cache-and-network",
  });

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(MY_RELEASE_WORLDS, {
    skip: status !== "authenticated",
    fetchPolicy: "cache-and-network",
  });

  const [createReleaseWorld, { loading: isCreating }] = useMutation(CREATE_RELEASE_WORLD);

  const releaseWorlds: ReleaseWorld[] = data?.myReleaseWorlds ?? [];
  const creativeProfiles: CreativeProfile[] = profileData?.myCreativeProfiles ?? [];

  const activeProfile = useMemo(() => {
    return creativeProfiles[0] ?? null;
  }, [creativeProfiles]);

  function updateForm<K extends keyof NewProjectForm>(key: K, value: NewProjectForm[K]) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "title" && !current.slug.trim()) {
        next.slug = slugify(String(value));
      }

      return next;
    });
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProfile) {
      setFormMessage("Create a CreativeProfile first. No artist profile found for this account.");
      return;
    }

    const title = form.title.trim();
    const slug = slugify(form.slug || form.title);

    if (!title || !slug) {
      setFormMessage("Project title and slug are required.");
      return;
    }

    try {
      setFormMessage("Creating project...");

      await createReleaseWorld({
        variables: {
          input: {
            creativeProfileId: activeProfile.id,
            title,
            slug,
            releaseType: form.releaseType,
            status: form.status,
            visibility: form.visibility,
            isFeatured: false,
            oneLineSummary: form.oneLineSummary.trim(),
            story: form.story.trim(),
            currentFocus: form.currentFocus.trim(),
            secondFocus: form.secondFocus.trim(),
            fullDropDate: form.fullDropDate || null,
          },
        },
      });

      setForm(initialForm);
      setFormMessage("Project created. Open its board to start building.");
      await refetch();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Unknown create project error.";
      setFormMessage(`Could not create project: ${message}`);
    }
  }

  return (
    <main className="creator-projects-page">
      <section className="creator-projects-shell">
        <div className="creator-projects-hero">
          <div>
            <p className="creator-projects-kicker">Creator Console</p>
            <h1>Project Library</h1>
            <p className="creator-projects-subtitle">
              Manage EPs, campaigns, and release worlds from one launch dashboard — then send the strongest worlds into the Nexus.
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
            <span className="creator-projects-status-label">Release system</span>
            <strong>Creator OS + Nexus</strong>
          </div>
          <div>
            <span className="creator-projects-status-label">Library</span>
            <strong>
              {releaseWorlds.length} release world{releaseWorlds.length === 1 ? "" : "s"}
            </strong>
          </div>
          <div>
            <span className="creator-projects-status-label">Profile</span>
            <strong>
              {profilesLoading
                ? "Loading..."
                : activeProfile?.displayName || activeProfile?.artistName || "No profile"}
            </strong>
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
            <h2>Connect your session to view saved projects.</h2>
            <p>
              The backend data exists, but this page needs a signed-in NextAuth session so Apollo
              can send your Authorization token.
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

        {status === "authenticated" && profilesError && (
          <section className="creator-projects-card creator-projects-message-card creator-projects-error-card">
            <p className="creator-projects-kicker">Profile Error</p>
            <h2>Could not load creative profiles.</h2>
            <p>{profilesError.message}</p>
          </section>
        )}

        {status === "authenticated" && (
          <section className="creator-projects-card creator-projects-create-card">
            <div className="creator-projects-create-heading">
              <div>
                <p className="creator-projects-kicker">New Release World</p>
                <h2>Create a project</h2>
                <p>
                  Start a new single, EP, album, or campaign. The Signal Board becomes the private workbench; the Release Page becomes the public portal.
                </p>
              </div>

              <div className="creator-projects-profile-pill">
                <span>Attached to</span>
                <strong>{activeProfile?.artistName ?? "No profile found"}</strong>
              </div>
            </div>

            <form className="creator-projects-form" onSubmit={handleCreateProject}>
              <div className="creator-projects-form-grid">
                <label>
                  Project title
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="Example: The Moon Tape"
                  />
                </label>

                <label>
                  Slug
                  <input
                    value={form.slug}
                    onChange={(event) => updateForm("slug", slugify(event.target.value))}
                    placeholder="the-moon-tape"
                  />
                </label>

                <label>
                  Release type
                  <select
                    value={form.releaseType}
                    onChange={(event) => updateForm("releaseType", event.target.value)}
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                    <option value="campaign">Campaign</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="released">Released</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <label>
                  Visibility
                  <select
                    value={form.visibility}
                    onChange={(event) => updateForm("visibility", event.target.value)}
                  >
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </label>

                <label>
                  Drop date
                  <input
                    type="date"
                    value={form.fullDropDate}
                    onChange={(event) => updateForm("fullDropDate", event.target.value)}
                  />
                </label>
              </div>

              <label>
                One-line summary
                <input
                  value={form.oneLineSummary}
                  onChange={(event) => updateForm("oneLineSummary", event.target.value)}
                  placeholder="A short sentence that explains the world."
                />
              </label>

              <div className="creator-projects-form-grid">
                <label>
                  Current focus
                  <input
                    value={form.currentFocus}
                    onChange={(event) => updateForm("currentFocus", event.target.value)}
                    placeholder="Lead single / main idea"
                  />
                </label>

                <label>
                  Second focus
                  <input
                    value={form.secondFocus}
                    onChange={(event) => updateForm("secondFocus", event.target.value)}
                    placeholder="Second single / contrast idea"
                  />
                </label>
              </div>

              <label>
                Story
                <textarea
                  value={form.story}
                  onChange={(event) => updateForm("story", event.target.value)}
                  placeholder="What is this release world about?"
                  rows={4}
                />
              </label>

              <div className="creator-projects-form-footer">
                <p>{formMessage || "Create a project, then open its board to begin."}</p>
                <button
                  className="creator-projects-primary-button"
                  type="submit"
                  disabled={isCreating || !activeProfile}
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
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
              Your backend is connected, but this account does not have saved release worlds yet.
              Create one above and it will appear here.
            </p>
          </section>
        )}

        {status === "authenticated" && !error && releaseWorlds.length > 0 && (
          <section className="creator-projects-grid">
            {releaseWorlds.map((world) => {
              const readiness = getReadinessScore(world);
              const featuredClassName = world.isFeatured ? " is-featured" : "";

              return (
                <article
                  className={`creator-projects-card creator-project-card creator-project-card-v2${featuredClassName}`}
                  key={world.id}
                >
                  <div className="creator-project-card-topline">
                    <span>{getProjectTypeCopy(world)}</span>
                    {world.isFeatured && <span>Nexus Featured</span>}
                  </div>

                  <div className="creator-project-card-mainline">
                    {world.coverArtUrl?.trim() ? (
                      <div className="creator-project-card-cover" aria-label={`${world.title} cover art`}>
                        <img src={world.coverArtUrl} alt={`${world.title} cover art`} />
                      </div>
                    ) : (
                      <div className="creator-project-card-cover creator-project-card-cover-empty" aria-hidden="true">
                        <span>{formatLabel(world.releaseType).slice(0, 2)}</span>
                      </div>
                    )}

                    <div>
                      <h2>{world.title}</h2>
                      <p className="creator-project-card-slug">/{world.slug}</p>

                      <p className="creator-project-card-summary">
                        {world.oneLineSummary?.trim() ||
                          world.story?.trim() ||
                          "No public summary yet. Add a one-line signal or story from the Signal Board."}
                      </p>
                    </div>
                  </div>

                  <div className="creator-project-readiness-panel">
                    <div className="creator-project-readiness-header">
                      <div>
                        <span>Release readiness</span>
                        <strong>{readiness.label}</strong>
                      </div>
                      <div className="creator-project-readiness-score">
                        {readiness.completeCount}/{readiness.totalCount}
                      </div>
                    </div>

                    <div className="creator-project-readiness-bar" aria-hidden="true">
                      <span style={{ width: `${readiness.percent}%` }} />
                    </div>

                    <div className="creator-project-readiness-list">
                      {readiness.items.map((item) => (
                        <div
                          key={item.label}
                          className={item.isComplete ? "is-complete" : "is-incomplete"}
                          title={item.hint}
                        >
                          <span>{item.isComplete ? "✓" : "○"}</span>
                          <strong>{item.label}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="creator-project-card-meta creator-project-card-meta-v2">
                    <div>
                      <span>World opens</span>
                      <strong>{formatDate(world.fullDropDate)}</strong>
                    </div>
                    <div>
                      <span>Lead signal</span>
                      <strong>{world.currentFocus || "TBD"}</strong>
                    </div>
                    <div>
                      <span>Second signal</span>
                      <strong>{world.secondFocus || "TBD"}</strong>
                    </div>
                    <div>
                      <span>Updated</span>
                      <strong>{formatDate(world.updatedAt)}</strong>
                    </div>
                  </div>

                  <div className="creator-project-card-actions creator-project-card-actions-v2">
                    <Link
                      href={`/releases/${world.slug}`}
                      className="creator-projects-primary-button"
                    >
                      Preview Portal
                    </Link>
                    <Link
                      href={`/releases/${world.slug}/board`}
                      className="creator-projects-secondary-button"
                    >
                      Signal Board
                    </Link>
                    <Link href="/nexus" className="creator-projects-secondary-button">
                      View Nexus
                    </Link>
                  </div>

                  <p className="creator-project-card-id">ReleaseWorld ID: {world.id}</p>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}