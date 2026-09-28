"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";

interface PasswordScreenProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = "2510";
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?~`";

export default function PasswordScreen({ onUnlock }: PasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [scrambleText, setScrambleText] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const pixelBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetDate = new Date(new Date().getFullYear(), 9, 25, 0, 0, 0).getTime(); // Oct 25th
    
    const checkTime = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsReady(true);
      } else {
        setIsReady(false);
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hacker text scramble effect
  const scramble = useCallback((target: string, callback?: () => void) => {
    let iteration = 0;
    const maxIterations = target.length * 3;

    const interval = setInterval(() => {
      const result = target
        .split("")
        .map((char, index) => {
          if (index < iteration / 3) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setScrambleText(result);
      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setScrambleText(target);
        callback?.();
      }
    }, 30);
  }, []);

  // Terminal typing effect
  const addTerminalLine = useCallback(
    (line: string, delay: number = 0) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line]);
          resolve();
        }, delay);
      });
    },
    []
  );

  // Boot sequence
  useEffect(() => {
    const boot = async () => {
      await addTerminalLine("$ initializing birthday_surprise.exe ...", 300);
      await addTerminalLine("[OK] Loading memories...", 600);
      await addTerminalLine("[OK] Preparing animations...", 400);
      await addTerminalLine("[OK] Loading pixel assets...", 500);
      await addTerminalLine("", 200);
      await addTerminalLine(">> SYSTEM READY", 300);
      await addTerminalLine(">> Awaiting password authentication...", 400);
    };
    boot();

    // Entrance animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(pixelBgRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 })
      .fromTo(lockRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, "-=0.8")
      .fromTo(formRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3");

    // Floating lock
    gsap.to(lockRef.current, { y: -8, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, [addTerminalLine]);

  // Initial scramble
  useEffect(() => {
    const timer = setTimeout(() => {
      scramble("🔐 Bạn có một món quà đặc biệt...");
    }, 800);
    return () => clearTimeout(timer);
  }, [scramble]);

  const handleSubmit = useCallback(() => {
    if (password === CORRECT_PASSWORD) {
      // Success terminal output
      const successSequence = async () => {
        await addTerminalLine("", 0);
        await addTerminalLine(">> Password: ****", 100);
        await addTerminalLine("[✓] ACCESS GRANTED", 300);
        await addTerminalLine("[✓] Decrypting memories...", 400);
        await addTerminalLine("[✓] Loading birthday surprise...", 300);
        scramble("🎉 WELCOME! Đang mở quà cho bạn...", () => {
          // Unlock animation
          const tl = gsap.timeline({ onComplete: onUnlock });
          tl.to(lockRef.current, { scale: 1.5, opacity: 0, rotation: 360, duration: 0.6, ease: "power2.in" })
            .to(containerRef.current, { opacity: 0, scale: 1.1, duration: 0.5, ease: "power2.in" }, "-=0.2");
        });
      };
      successSequence();
    } else {
      // Error
      setError(true);
      addTerminalLine(">> Password: ****", 0);
      addTerminalLine("[✗] ACCESS DENIED - Wrong password!", 200);

      gsap.to(formRef.current, { x: [-20, 20, -15, 15, -8, 8, 0], duration: 0.5, ease: "power2.out" } as any);
      gsap.to(lockRef.current, { rotation: [-8, 8, -5, 5, 0], duration: 0.4, ease: "power2.out" } as any);

      scramble("❌ Sai mật khẩu! Thử lại nhé...");

      setTimeout(() => {
        setError(false);
        setPassword("");
      }, 1500);
    }
  }, [password, onUnlock, addTerminalLine, scramble]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col">
      {/* Pixel art background */}
      <div
        ref={pixelBgRef}
        className="absolute inset-0 opacity-0"
        style={{
          backgroundImage: "url('/pixel-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "auto",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Scanlines */}
      <div className="scanlines" />

      {/* Top half - Pixel scene with password */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {/* Scramble title */}
        <div
          className="scramble-text text-lg md:text-2xl text-pixel-pink mb-8 text-center tracking-wider"
          style={{ fontFamily: "var(--font-mono)", minHeight: "2em" }}
        >
          {scrambleText}
        </div>

        {/* Lock icon with pixel border */}
        <div ref={lockRef} className="mb-6">
          <div
            className="w-24 h-24 flex items-center justify-center pixel-border"
            style={{ background: "rgba(13, 2, 33, 0.8)" }}
          >
            <span className="text-5xl pixel-float">🔒</span>
          </div>
        </div>

        {/* Password form or Countdown */}
        <div ref={formRef} className="w-full max-w-sm opacity-0">
          {isReady ? (
            <>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mật khẩu..."
                autoFocus
                className={`w-full px-5 py-3.5 text-center text-lg tracking-[0.3em] 
                  bg-pixel-dark/80 text-foreground placeholder-foreground/30
                  input-glow transition-all duration-300
                  ${error ? "border-2 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "border-2 border-pixel-purple/50"}`}
                style={{ fontFamily: "var(--font-mono)", borderRadius: 0 }}
              />

              {/* Error msg */}
              <div className={`text-center mt-2 text-sm transition-opacity duration-300 ${error ? "opacity-100 text-red-400" : "opacity-0"}`}
                style={{ fontFamily: "var(--font-mono)" }}>
                [ERROR] Sai mật khẩu! 🔐
              </div>

              <button
                id="password-submit"
                onClick={handleSubmit}
                className="w-full mt-4 py-3.5 font-bold text-lg cursor-pointer
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  border-2 border-pixel-pink text-pixel-dark"
                style={{
                  background: "linear-gradient(135deg, var(--pixel-pink) 0%, var(--pixel-purple) 100%)",
                  fontFamily: "var(--font-mono)",
                  borderRadius: 0,
                  boxShadow: "4px 4px 0 0 rgba(199,113,237,0.5)",
                }}
              >
                ▶ MỞ QUÀ
              </button>

              <p className="text-center mt-4 text-foreground/30 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                // hint: ngày sinh nhật (ddmm) 💝
              </p>
            </>
          ) : (
            <div className="bg-pixel-dark/80 border-2 border-pixel-purple/50 p-6 input-glow shadow-[0_0_20px_rgba(199,113,237,0.2)]">
              <p className="text-pixel-pink mb-4 text-center" style={{ fontFamily: "var(--font-mono)" }}>
                [ SYSTEM LOCKED ]<br/>
                Sẽ mở khóa vào 25/10:
              </p>
              <div className="flex justify-center gap-4 text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="flex flex-col items-center">
                  <span className="text-pixel-cyan">{String(timeLeft.d).padStart(2, '0')}</span>
                  <span className="text-[10px] text-foreground/50 mt-1 tracking-widest">NGÀY</span>
                </div>
                <span className="text-pixel-purple animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-pixel-cyan">{String(timeLeft.h).padStart(2, '0')}</span>
                  <span className="text-[10px] text-foreground/50 mt-1 tracking-widest">GIỜ</span>
                </div>
                <span className="text-pixel-purple animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-pixel-cyan">{String(timeLeft.m).padStart(2, '0')}</span>
                  <span className="text-[10px] text-foreground/50 mt-1 tracking-widest">PHÚT</span>
                </div>
                <span className="text-pixel-purple animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-pixel-cyan">{String(timeLeft.s).padStart(2, '0')}</span>
                  <span className="text-[10px] text-foreground/50 mt-1 tracking-widest">GIÂY</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom half - Terminal */}
      <div className="relative z-10 h-[200px] md:h-[220px]">
        <div ref={terminalRef} className="terminal h-full p-4 overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-terminal-green/20">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <span className="text-terminal-green/50 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              birthday_terminal.sh
            </span>
          </div>

          {/* Terminal content */}
          <div className="relative z-10 space-y-1">
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className="text-sm md:text-base"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: line.includes("[✓]")
                    ? "#43e97b"
                    : line.includes("[✗]")
                    ? "#ff4444"
                    : line.includes(">>")
                    ? "#ffd700"
                    : line.includes("[OK]")
                    ? "#00ff41"
                    : "#00ff41",
                }}
              >
                {line}
              </div>
            ))}
            <span className="typing-cursor text-sm" style={{ fontFamily: "var(--font-mono)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
