"use client";

import "@/styles/ritualList.css";

export type Ritual = {
    id: string;
    title: string;
    description: string;
};

type RitualListProps = {
    rituals?: Ritual[];
    loading?: boolean;
    error?: {
        message?: string;
    } | null;
    onEdit?: (ritual: Ritual) => void;
    onDelete?: (id: string) => void;
};

export default function RitualList({
    rituals,
    loading,
    error,
    onEdit,
    onDelete,
}: RitualListProps) {
    if (loading) {
        return <p className="ritual-list-status">Loading rituals...</p>;
    }

    if (error) {
        return (
            <p className="ritual-list-status is-error" role="alert">
                Unable to load rituals: {error.message}
            </p>
        );
    }

    if (!rituals || rituals.length === 0) {
        return (
            <div className="ritual-list-empty">
                <strong>No rituals yet.</strong>
                <p>Create the first repeatable anchor for your practice.</p>
            </div>
        );
    }

    return (
        <ul className="rituals-list" aria-label="Ritual library">
            {rituals.map((ritual, index) => (
                <li key={ritual.id} className="rituals-list-item">
                    <div className="rituals-list-index" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="rituals-list-copy">
                        <p className="rituals-list-eyebrow">Reusable anchor</p>
                        <h2>{ritual.title}</h2>
                        <p>{ritual.description || "No description added yet."}</p>
                    </div>

                    <div className="rituals-list-actions">
                        <button
                            type="button"
                            className="ritual-edit-button"
                            onClick={() => onEdit?.(ritual)}
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="ritual-delete-button"
                            onClick={() => onDelete?.(ritual.id)}
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
