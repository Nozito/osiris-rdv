"use client";
// OSIRIS UX — scroll-to-top button (appears after 200px scroll)

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Retour en haut"
      className={`
        fixed bottom-8 left-4 z-30
        w-9 h-9 rounded-full
        bg-surface2 border border-white/10
        text-faint hover:text-textc
        flex items-center justify-center
        shadow-lg transition-all duration-300 ease-out
        ${visible ? "opacity-70 hover:opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
      `}
    >
      <ArrowUp size={15} />
    </button>
  );
}
