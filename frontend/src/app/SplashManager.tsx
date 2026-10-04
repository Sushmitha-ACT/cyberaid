"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function SplashManager({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [logText, setLogText] = useState("Initializing kernel...");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown this session
    const splashShown = sessionStorage.getItem("splashShown");
    
    if (splashShown) {
      // If already shown, just mount immediately without splash
      setHasMounted(true);
      return;
    }

    // Otherwise, show the splash screen
    setShowSplash(true);
    setHasMounted(true);

    // Sequence of terminal logs
    const logs = [
      "Establishing secure tunnel...",
      "Encrypting payload data...",
      "Verifying zero-trust parameters...",
      "CONNECTION SECURED"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setLogText(logs[index]);
        index++;
      }
    }, 450); // change text every 450ms

    // Total splash duration: 2.5s
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("splashShown", "true");
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Prevent hydration mismatch and layout shift by rendering a blank black background for 1 frame
  if (!hasMounted) {
    return <div className="fixed inset-0 bg-background pointer-events-none" />;
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.5, ease: "easeIn" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Static Cyber Grid Background (Removed animation for performance) */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-20" 
          />
          
          {/* Intense Center Glow */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.2], opacity: [0, 0.4, 0.15] }}
            transition={{ duration: 2, ease: "circOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary rounded-full blur-[150px] pointer-events-none -z-10" 
          />

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex flex-col items-center justify-center relative z-10 w-full will-change-transform"
          >
            {/* Animated Hexagon Shield Logo */}
            <div className="relative group mb-8">
              {/* Outer spinning radar */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border-[1px] border-primary/20 border-t-primary/80 border-r-primary/80 rounded-full opacity-70 will-change-transform"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-[2px] border-dashed border-blue-400/30 rounded-full will-change-transform"
              />

              <div className="h-32 w-32 bg-background/90 backdrop-blur-sm border border-primary shadow-[0_0_40px_rgba(59,130,246,0.3)] rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                {/* Glitch Overlay */}
                <motion.div 
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-2 bg-primary/30 z-20 will-change-transform"
                />
                <ShieldCheck className="h-16 w-16 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] z-10" />
              </div>
            </div>
            
            {/* Reveal Text */}
            <h1 className="text-5xl font-heading font-black tracking-tighter text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] flex">
              {"CyberAid".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
                  className="will-change-transform"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            
            {/* Terminal Boot Sequence */}
            <div className="flex flex-col items-center justify-center mt-6 w-full max-w-xs">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-3 relative">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="absolute left-0 top-0 bottom-0 bg-primary shadow-[0_0_10px_#3b82f6]"
                />
              </div>
              <motion.p 
                key={logText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-primary text-xs font-mono tracking-widest uppercase text-center"
              >
                [SYS] {logText}
              </motion.p>
            </div>
            
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
