"use client";

import { useQuery, useMutation } from "@apollo/client";
import {
  ALL_RITUALS,
  ADD_RITUAL,
  UPDATE_RITUAL,
  DELETE_RITUAL,
} from "@/graphql/rituals";

// ✅ Component imports
import CosmicBackground from "@/components/CosmicBackground";
import RitualList from "@/components/RitualList";
import AddRitualForm from "@/components/AddRitualForm";

import "@/styles/ritualsPage.css";

// ✅ Define a type for ritual entries
interface RitualEntry {
  id: string;
  title: string;
  description: string;
}

export default function RitualsPage() {
  const { data, loading, error, refetch } = useQuery(ALL_RITUALS);
  const [addRitual] = useMutation(ADD_RITUAL);
  const [updateRitual] = useMutation(UPDATE_RITUAL);
  const [deleteRitual] = useMutation(DELETE_RITUAL);

  const handleAdd = async (title: string, description: string) => {
    const cleanTitle = title.trim();
    const cleanDescription = description?.trim() || "";

    if (!cleanTitle) {
      console.error("❗ Ritual title is required before adding!");
      return;
    }

    try {
      await addRitual({
        variables: { title: cleanTitle, description: cleanDescription },
      });
      refetch();
    } catch (e) {
      console.error("❌ Failed to add ritual:", e);
    }
  };

  const handleEdit = async (ritual: RitualEntry) => {
    const updatedTitle = prompt("Edit ritual title:", ritual.title);
    const updatedDescription = prompt(
      "Edit ritual description:",
      ritual.description
    );
    if (updatedTitle !== null && updatedDescription !== null) {
      try {
        await updateRitual({
          variables: {
            id: ritual.id,
            title: updatedTitle,
            description: updatedDescription,
          },
        });
        refetch();
      } catch (e) {
        console.error("❌ Failed to update ritual:", e);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ritual?")) {
      try {
        await deleteRitual({ variables: { id } });
        refetch();
      } catch (e) {
        console.error("❌ Failed to delete ritual:", e);
      }
    }
  };

  return (
    <main className="rituals-page min-h-screen flex flex-col items-center justify-start p-6 relative overflow-hidden">
      <CosmicBackground /> {/* 🔮 Background component */}

      <h1 className="text-3xl font-bold mb-4">📖 My Ritual Library</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Create, edit, and manage your daily rituals below.
      </p>

      <RitualList
        rituals={data?.allRituals}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="mt-12 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">➕ Add New Ritual</h2>
        <AddRitualForm onAdd={handleAdd} />
      </div>
    </main>
  );
}