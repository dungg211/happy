"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const PIXEL_COLORS = [
  "#ff6b9d", "#c471ed", "#667eea", "#00d2ff",
  "#ffd700", "#43e97b", "#f093fb", "#ff4444",
  "#ff8c00", "#00ff41",
];

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 100; i++) {
      const piece = document.createElement("div");
      const color = PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
      const size = Math.random() > 0.5 ? 6 : 4;

      piece.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: -10px;
        pointer-events: none;
        z-index: 200;
        image-rendering: pixelated;
        border-radius: 0;
      `;

      container.appendChild(piece);
      pieces.push(piece);

      gsap.to(piece, {
        y: window.innerHeight + 50,
        x: `+=${(Math.random() - 0.5) * 400}`,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 1.2,
        ease: "power1.out",
      });
    }

    // Also spawn some emoji confetti
    const emojis = ["🎉", "🎊", "⭐", "💖", "🌸", "🎂", "🎁", "✨"];
    for (let i = 0; i < 15; i++) {
      const emoji = document.createElement("div");
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -40px;
        pointer-events: none;
        z-index: 201;
        font-size: ${16 + Math.random() * 16}px;
      `;
      container.appendChild(emoji);
      pieces.push(emoji);

      gsap.to(emoji, {
        y: window.innerHeight + 50,
        x: `+=${(Math.random() - 0.5) * 300}`,
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 1,
        ease: "power1.out",
      });
    }

    const timeout = setTimeout(() => {
      pieces.forEach((p) => p.remove());
    }, 6000);

    return () => {
      clearTimeout(timeout);
      pieces.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[200]" />;
}
