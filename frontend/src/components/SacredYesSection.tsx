"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import {
  GET_SACRED_YES,
  ADD_SACRED_YES,
  UPDATE_SACRED_YES,
} from "@/graphql/sacredYes";
import "@/styles/sacredYes.css";

export default function SacredYesSection() {
  const { data: session } = useSession();
  const today = dayjs().format("YYYY-MM-DD");

  const { data, loading, error, refetch } = useQuery(GET_SACRED_YES, {
    variables: { date: today },
    skip: !session,
  });

  const [text, setText] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [add] = useMutation(ADD_SACRED_YES);
  const [update] = useMutation(UPDATE_SACRED_YES);

  useEffect(() => {
    setText(data?.getSacredYes?.text ?? "");
  }, [data]);

  const handleSave = async () => {
    const cleanText = text.trim();

    if (!cleanText) {
      setSaveState("error");
      return;
    }

    setSaveState("saving");

    try {
      const existing = data?.getSacredYes;

      if (existing?.id) {
        await update({ variables: { id: existing.id, text: cleanText } });
      } else {
        await add({ variables: { text: cleanText, date: today } });
      }

      await refetch();
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2200);
    } catch (e) {
      console.error("Error saving Sacred Yes:", e);
      setSaveState("error");
    }
  };

  const hasSavedEntry = Boolean(data?.getSacredYes);

  return (
    <section className="sacred-yes-card" aria-labelledby="sacred-yes-title">
      <div className="sacred-yes-header">
        <div>
          <p className="sacred-yes-eyebrow">Daily commitment</p>
          <h2 id="sacred-yes-title">Today&apos;s Sacred Yes</h2>
        </div>
        <span className="sacred-yes-date">{dayjs(today).format("MMM D")}</span>
      </div>

      <p className="sacred-yes-prompt">
        Name the commitment that deserves a clear yes from you today.
      </p>

      {loading && <p className="inner-status">Loading your commitment...</p>}
      {error && (
        <p className="inner-status is-error" role="alert">
          Unable to load Sacred Yes: {error.message}
        </p>
      )}

      <label className="sacred-yes-field">
        <span>Sacred Yes</span>
        <textarea
          name="sacredYes"
          placeholder="What are you choosing today?"
          rows={4}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (saveState !== "idle") setSaveState("idle");
          }}
        />
      </label>

      <div className="sacred-yes-footer">
        <p className={`inner-status ${saveState === "error" ? "is-error" : saveState === "saved" ? "is-success" : ""}`}>
          {saveState === "saving" && "Saving..."}
          {saveState === "saved" && "Sacred Yes saved."}
          {saveState === "error" && "Enter a commitment before saving."}
        </p>

        <button type="button" onClick={handleSave} disabled={loading || saveState === "saving"}>
          {saveState === "saving"
            ? "Saving"
            : hasSavedEntry
              ? "Update Sacred Yes"
              : "Save Sacred Yes"}
        </button>
      </div>
    </section>
  );
}
