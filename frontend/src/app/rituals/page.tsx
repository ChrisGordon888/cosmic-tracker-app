"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  ALL_RITUALS,
  ADD_RITUAL,
  UPDATE_RITUAL,
  DELETE_RITUAL,
} from "@/graphql/rituals";
import PracticeShell from "@/components/practice/PracticeShell";
import RitualList, { type Ritual } from "@/components/RitualList";
import AddRitualForm from "@/components/AddRitualForm";
import "@/styles/ritualsPage.css";


export default function RitualsPage() {
  const {data:session,status}=useSession();
  const { data, loading, error, refetch } = useQuery(ALL_RITUALS, {skip:!session});
  const [addRitual] = useMutation(ADD_RITUAL);
  const [updateRitual] = useMutation(UPDATE_RITUAL);
  const [deleteRitual] = useMutation(DELETE_RITUAL);

  const rituals = (data?.allRituals ?? []) as Ritual[];

  const handleAdd = async (title: string, description: string) => {
    const cleanTitle = title.trim();
    const cleanDescription = description?.trim() || "";

    if (!cleanTitle) {
      console.error("Ritual title is required before adding.");
      return;
    }

    try {
      await addRitual({ variables: { title: cleanTitle, description: cleanDescription } });
      await refetch();
    } catch (e) {
      console.error("Failed to add ritual:", e);
    }
  };

  const handleEdit = async (ritual: Ritual) => {
    const updatedTitle = prompt("Edit ritual title:", ritual.title);
    const updatedDescription = prompt("Edit ritual description:", ritual.description);

    if (updatedTitle !== null && updatedDescription !== null) {
      try {
        await updateRitual({
          variables: {
            id: ritual.id,
            title: updatedTitle,
            description: updatedDescription,
          },
        });
        await refetch();
      } catch (e) {
        console.error("Failed to update ritual:", e);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ritual?")) {
      try {
        await deleteRitual({ variables: { id } });
        await refetch();
      } catch (e) {
        console.error("Failed to delete ritual:", e);
      }
    }
  };

  if(!session) return <PracticeShell><section className="practice-state-card"><h1>{status==='loading'?'Opening your practice…':'Your personal chamber'}</h1><p>Sign in to keep your rituals and history connected to your account.</p><Link href="/auth?callbackUrl=%2Frituals">Sign in →</Link></section></PracticeShell>;

  return (
    <PracticeShell className="rituals-page practice-subpage">


      <section className="practice-subpage-hero rituals-hero">
        <div>
          <p className="practice-subpage-kicker">Ritual Library</p>
          <h1>Keep your daily anchors close.</h1>
          <p>
            Create, refine, and protect the rituals that hold your signal steady across music, body, spirit, and life.
          </p>
        </div>
        <div className="practice-subpage-actions">
          <Link href="/practice">Practice Portal</Link>
          <Link href="/tracker">Tracker</Link>
          <Link href="/calendar">Calendar</Link>
        </div>
      </section>

      <section className="rituals-stats-grid" aria-label="Ritual stats">
        <article>
          <span>Total Rituals</span>
          <strong>{loading ? "..." : rituals.length}</strong>
        </article>
        <article>
          <span>Current Layer</span>
          <strong>Daily</strong>
        </article>
        <article>
          <span>Purpose</span>
          <strong>Anchor</strong>
        </article>
      </section>

      <section className="rituals-workspace">
        <div className="rituals-section-heading">
          <p className="practice-subpage-kicker">Saved Rituals</p>
          <h2>Your current library.</h2>
        </div>
        <RitualList
          rituals={data?.allRituals}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      <section className="rituals-add-card">
        <div className="rituals-section-heading">
          <p className="practice-subpage-kicker">New Anchor</p>
          <h2>Add a ritual.</h2>
          <p>Small repeatable practices become the structure that carries the larger vision.</p>
        </div>
        <AddRitualForm onAdd={handleAdd} />
      </section>
    </PracticeShell>
  );
}
