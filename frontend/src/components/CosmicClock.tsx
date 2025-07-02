"use client";

import { useState, useEffect } from "react";

export default function CosmicClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
      ⏰ Current Time: {time.toLocaleTimeString()}
    </div>
  );
}