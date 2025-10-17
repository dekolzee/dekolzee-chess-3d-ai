import { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { musicManager } from "@/utils/backgroundMusic";

const Index = () => {
  useEffect(() => {
    musicManager.play();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Hero />
      <Features />
    </div>
  );
};

export default Index;
