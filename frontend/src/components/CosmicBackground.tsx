"use client";

import "@/styles/cosmicBackground.css";

export default function CosmicBackground() {
  return (
    <div className="cosmic-background" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="cosmic-background-video"
      >
        <source src="/cosmic-lava-lamp.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
