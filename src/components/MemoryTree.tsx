"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import memoriesData from "@/data/memories.json";
import WishModal from "./WishModal";

interface Memory {
  id: number;
  image: string;
  title: string;
  wish: string;
}

const memories: Memory[] = memoriesData;

// ===== Starfield Background =====
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; size: number; speed: number; opacity: number; twinkleSpeed: number; phase: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8 + 0.1})`;
        ctx.fill();

        // Add glow to bigger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          grd.addColorStop(0, `rgba(200, 180, 255, ${twinkle * 0.15})`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Slow drift
        star.y += star.speed;
        if (star.y > canvas.height + 5) {
          star.y = -5;
          star.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

// ===== Floating Hearts =====
function FloatingHearts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const emojis = ["💖", "💕", "💗", "✨", "💜", "🤍", "💫"];

    const spawn = () => {
      const el = document.createElement("div");
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed;
        bottom: -40px;
        left: ${Math.random() * 100}vw;
        font-size: ${16 + Math.random() * 20}px;
        pointer-events: none;
        z-index: 5;
        filter: blur(${Math.random() > 0.7 ? 1 : 0}px);
      `;
      container.appendChild(el);

      gsap.to(el, {
        y: -(window.innerHeight + 80),
        x: `+=${(Math.random() - 0.5) * 150}`,
        opacity: 0,
        rotation: (Math.random() - 0.5) * 360,
        duration: 8 + Math.random() * 6,
        ease: "none",
        onComplete: () => el.remove(),
      });
    };

    const interval = setInterval(spawn, 1500);
    // Spawn a few immediately
    for (let i = 0; i < 5; i++) setTimeout(spawn, i * 300);

    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]" />;
}

// ===== 3D Orbiting Galaxy Photos =====
function GalaxyOrbit({
  memories,
  onPhotoClick,
}: {
  memories: Memory[];
  onPhotoClick: (memory: Memory, index: number) => void;
}) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.3);
    }, 30);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate positions on an elliptical orbit
  const getPhotoStyle = (index: number, total: number) => {
    const theta = ((2 * Math.PI) / total) * index + (angle * Math.PI) / 180;
    const radiusX = Math.min(window.innerWidth * 0.35, 380);
    const radiusY = Math.min(window.innerWidth * 0.15, 160);

    const x = Math.cos(theta) * radiusX;
    const y = Math.sin(theta) * radiusY * 0.6;
    const z = Math.sin(theta) * 200;

    const scale = (z + 300) / 500;
    const opacity = Math.max(0.3, (z + 300) / 400);
    const zIndex = Math.round(z + 200);

    const isHovered = hoveredIndex === index;

    return {
      transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) scale(${isHovered ? scale * 1.3 : scale})`,
      opacity: isHovered ? 1 : opacity,
      zIndex: isHovered ? 999 : zIndex,
      transition: "transform 0.1s linear, opacity 0.1s linear",
    };
  };

  return (
    <div
      ref={orbitRef}
      className="relative w-full flex items-center justify-center"
      style={{ height: "50vh", minHeight: "350px", perspective: "1000px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setHoveredIndex(null);
      }}
    >
      {/* Center glow orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="galaxy-center-orb" />
      </div>

      {/* Orbiting photos */}
      {memories.map((memory, index) => (
        <div
          key={memory.id}
          className="absolute top-1/2 left-1/2 cursor-pointer galaxy-photo"
          style={getPhotoStyle(index, memories.length)}
          onClick={() => onPhotoClick(memory, index)}
          onMouseEnter={() => {
            setIsPaused(true);
            setHoveredIndex(index);
          }}
          onMouseLeave={() => {
            setHoveredIndex(null);
          }}
        >
          <div className="galaxy-photo-frame">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-lg">
              <Image
                src={memory.image}
                alt={memory.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <p className="galaxy-photo-title">{memory.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Main Component =====
export default function MemoryTree() {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [titleText, setTitleText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Typewriter title effect
  useEffect(() => {
    const target = "Happy Birthday! 🎂";
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i <= target.length) {
          setTitleText(target.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          // Show subtitle after title
          setTimeout(() => setShowSubtitle(true), 300);
        }
      }, 80);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animate subtitle entry
  useEffect(() => {
    if (showSubtitle && subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, [showSubtitle]);

  const handlePhotoClick = useCallback(
    (memory: Memory, index: number) => {
      setSelectedMemory(memory);
    },
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden galaxy-bg">
      {/* Starfield */}
      <Starfield />

      {/* Floating hearts */}
      <FloatingHearts />

      {/* Nebula glow effects */}
      <div className="galaxy-nebula galaxy-nebula-1" />
      <div className="galaxy-nebula galaxy-nebula-2" />
      <div className="galaxy-nebula galaxy-nebula-3" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen">
        {/* Title Section */}
        <div className="text-center pt-10 pb-2 px-4">
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 galaxy-title"
          >
            {titleText}
            <span className="galaxy-cursor">|</span>
          </h1>

          {showSubtitle && (
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl md:text-2xl opacity-0 galaxy-subtitle"
            >
              ✨ Nhấn vào từng bức ảnh để xem lời chúc dành riêng cho bạn ✨
            </p>
          )}
        </div>

        {/* Galaxy orbit with photos */}
        <GalaxyOrbit memories={memories} onPhotoClick={handlePhotoClick} />

        {/* Romantic message at bottom */}
        <div className="text-center pb-10 px-4 mt-auto">
          <div className="galaxy-message-box">
            <p className="text-base sm:text-lg md:text-xl galaxy-romantic-text">
              💕 Mỗi bức ảnh là một kỷ niệm, mỗi kỷ niệm là một vì sao trong thiên hà của chúng ta 💕
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400/40" />
            <span className="text-purple-300/40 text-sm tracking-widest">
              ✦ ✦ ✦
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-400/40" />
          </div>
          <p className="text-white/20 text-sm mt-3" style={{ fontFamily: "var(--font-script)" }}>
            Made with 💖 for you
          </p>
        </div>
      </div>

      {/* Wish Modal */}
      {selectedMemory && (
        <WishModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </div>
  );
}
