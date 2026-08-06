"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "@/styles/cosmicClock.css";

type CosmicClockProps = {
    className?: string;
};

export default function CosmicClock({ className = "" }: CosmicClockProps) {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        const updateTime = () => setTime(new Date());

        updateTime();
        const interval = window.setInterval(updateTime, 1000);

        return () => window.clearInterval(interval);
    }, []);

    if (!time) {
        return (
            <div className={`cosmic-clock-card ${className}`} aria-live="polite">
                <p className="cosmic-clock-label">Current time</p>
                <p className="cosmic-clock-time">Loading...</p>
            </div>
        );
    }

    const today = dayjs(time).format("dddd, MMMM D, YYYY");

    return (
        <div className={`cosmic-clock-card ${className}`} aria-live="polite">
            <div className="cosmic-clock-primary">
                <p className="cosmic-clock-label">Current time</p>
                <p className="cosmic-clock-time">
                    {time.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
                </p>
            </div>

            <div className="cosmic-clock-divider" aria-hidden="true" />

            <div className="cosmic-clock-secondary">
                <p className="cosmic-clock-label">Today</p>
                <p className="cosmic-clock-date">{today}</p>
            </div>
        </div>
    );
}
