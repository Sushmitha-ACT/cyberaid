"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BackgroundVideo() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  if (isReducedMotion) {
    return (
      <div className="fixed inset-0 z-[-1] bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.1),rgba(255,255,255,0))]" />
    );
  }

  return (
    <div className="fixed inset-0 z-[-2] w-full h-full overflow-hidden bg-background">
      {/* 
        Generated SecurBox-style Isometric Cybersecurity Background
      */}
      <motion.div 
        initial={{ filter: "brightness(2) contrast(1.2)", opacity: 0.8 }}
        animate={{ filter: "brightness(1) contrast(1)", opacity: 0.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/securbox-bg.png")' }}
      />
      
      {/* Grid overlay for subtle technical texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      {/* Dark gradient overlay for readability so text stays legible over the illustrations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background pointer-events-none" />
    </div>
  );
}
