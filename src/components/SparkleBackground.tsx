"use client";

import { useEffect, useRef } from "react";

interface PixelStar {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
  color: string;
}

const COLORS = ["#ff6b9d", "#c471ed", "#667eea", "#00d2ff", "#ffd700", "#43e97b", "#f093fb"];

export default function SparkleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: PixelStar[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create pixel stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() > 0.7 ? 3 : 2,
        brightness: Math.random(),
        speed: Math.random() * 0.01 + 0.005,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Twinkle
        star.brightness += star.speed;
        if (star.brightness >= 1 || star.brightness <= 0) star.speed *= -1;

        ctx.globalAlpha = star.brightness * 0.7;
        ctx.fillStyle = star.color;

        // Pixel-perfect rendering (no anti-aliasing)
        const px = Math.round(star.x);
        const py = Math.round(star.y);
        const s = star.size;

        // Draw pixel cross/diamond shape
        ctx.fillRect(px, py - s, s, s); // top
        ctx.fillRect(px - s, py, s, s); // left
        ctx.fillRect(px, py, s, s); // center
        ctx.fillRect(px + s, py, s, s); // right
        ctx.fillRect(px, py + s, s, s); // bottom
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="sparkle-canvas" aria-hidden="true" />;
}
