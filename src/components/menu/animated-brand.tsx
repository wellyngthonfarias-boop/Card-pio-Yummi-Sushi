"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export function AnimatedBrand() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectPreference = () => { if (preference.matches) video.current?.pause(); };
    respectPreference();
    preference.addEventListener("change", respectPreference);
    return () => preference.removeEventListener("change", respectPreference);
  }, []);
  return <figure className="hero-figure hero-animation">
    <video ref={video} autoPlay muted loop playsInline preload="metadata"
      width={1080} height={1920} poster="/brand/yummi-sushi-logo.webp"
      aria-label="Logo animada do Yummi Sushi Delivery"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
      <source src="/brand/yummi-sushi-animation.mp4" type="video/mp4" />
      Seu navegador não suporta a animação. Yummi Sushi Delivery.
    </video>
    <button type="button" className="brand-playback" aria-label={playing ? "Pausar animação da logo" : "Reproduzir animação da logo"}
      onClick={() => { if (!video.current) return; if (video.current.paused) void video.current.play().catch(() => setPlaying(false)); else video.current.pause(); }}>
      {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
    </button>
  </figure>;
}
