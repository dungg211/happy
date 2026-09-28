"use client";

import { useState } from "react";
import PasswordScreen from "@/components/PasswordScreen";
import MemoryTree from "@/components/MemoryTree";
import SparkleBackground from "@/components/SparkleBackground";
import Confetti from "@/components/Confetti";

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUnlock = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setIsUnlocked(true);
    }, 300);

    // Remove confetti after burst
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <main className="relative min-h-screen">
      <SparkleBackground />

      {!isUnlocked && <PasswordScreen onUnlock={handleUnlock} />}

      {isUnlocked && <MemoryTree />}

      {showConfetti && <Confetti />}
    </main>
  );
}
