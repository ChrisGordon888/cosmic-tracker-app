"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SACRED_YES, ADD_SACRED_YES, UPDATE_SACRED_YES } from "@/graphql/sacredYes";
import dayjs from "dayjs";
import "@/styles/sacredYes.css";


export default function SacredYesSection() {
    const { data: session } = useSession();
    const today = dayjs().format("YYYY-MM-DD");

    const { data, loading, error, refetch } = useQuery(
        GET_SACRED_YES,
        { variables: { date: today }, skip: !session }
    );
    const [text, setText] = useState("");
    const [add] = useMutation(ADD_SACRED_YES);
    const [update] = useMutation(UPDATE_SACRED_YES);

    useEffect(() => {
        if (data?.getSacredYes) setText(data.getSacredYes.text);
        else setText("");
    }, [data]);

    const handleSave = async () => {
        try {
            const existing = data?.getSacredYes;
            if (existing?.id) {
                await update({ variables: { id: existing.id, text } });
            } else {
                await add({ variables: { text, date: today } });
            }
            refetch();
        } catch (e) {
            console.error("❌ Error saving Sacred Yes:", e);
        }
    };

    return (
        <section className="sacred-yes-card">
            <h2>🌟 Today's Sacred Yes</h2>
            {loading && <p>Loading your sacred intention...</p>}
            {error && <p className="text-red-600">Error: {error.message}</p>}
            <textarea
                name="sacredYes"
                placeholder="What do you say yes to today?"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleSave}>
                {data?.getSacredYes ? "Update Sacred Yes" : "Save Sacred Yes"}
            </button>
        </section>
    );
}