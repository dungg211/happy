"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface Memory {
  id: number;
  image: string;
  title: string;
  wish: string;
}

interface WishModalProps {
  memory: Memory;
  onClose: () => void;
}

export default function WishModal({ memory, onClose }: WishModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const text = memory.wish;
    setDisplayedText("");
    setIsTypingDone(false);

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTypingDone(true);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [memory.wish]);

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        cardRef.current,
        { scale: 0.6, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
      );
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, { scale: 0.8, opacity: 0, y: -30, duration: 0.3, ease: "power2.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(5, 0, 20, 0.85)", backdropFilter: "blur(12px)" }}
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className="w-[92vw] max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass card */}
        <div className="galaxy-wish-card">
          {/* Photo */}
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-5">
            <Image
              src={memory.image}
              alt={memory.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 448px"
            />
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💝</span>
            <h3 className="text-xl sm:text-2xl font-bold galaxy-wish-title">
              {memory.title}
            </h3>
          </div>

          {/* Wish text with typewriter */}
          <p className="text-white/85 leading-relaxed text-base sm:text-lg" style={{ fontFamily: "var(--font-sans)" }}>
            {displayedText}
            {!isTypingDone && (
              <span className="inline-block ml-1 animate-pulse text-purple-300">▌</span>
            )}
          </p>

          {/* Close button */}
          {isTypingDone && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={handleClose}
                className="galaxy-close-btn cursor-pointer"
              >
                ✨ Đóng ✨
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
