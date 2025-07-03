"use client";
import "@/styles/cosmicBackground.css";

export default function CosmicBackground() {
  return (
    <div className="cosmic-background">
      <video
        src="/cosmic-lava-lamp.mp4" // ✅ put your MP4 in /public as cosmic-lava-lamp.mp4
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full absolute top-0 left-0 z-0"
      />
    </div>
  );
}