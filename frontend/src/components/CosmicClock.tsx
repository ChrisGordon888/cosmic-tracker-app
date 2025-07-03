"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "@/styles/cosmicClock.css";

export default function CosmicClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const today = dayjs(time).format("dddd, MMMM D, YYYY");

  return (
    <div className="cosmic-clock-card">
      <p className="cosmic-clock-time">⏰ Current Time: {time.toLocaleTimeString()}</p>
      <p className="cosmic-clock-date">📅 Today: {today}</p>
    </div>
  );
}