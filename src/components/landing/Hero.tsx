import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-4"
            >
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Chess Experience</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
              <span className="glow-text bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Dekolzee Chess
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience the timeless game in stunning 3D. Challenge AI, compete with friends, and master the board.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="hero-button text-lg px-12 py-6 group"
              onClick={() => navigate("/lobby")}
            >
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Play Now
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="game-button text-lg px-12 py-6"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
          >
            {[
              { title: "3D Graphics", desc: "Immersive board" },
              { title: "AI Opponent", desc: "Smart challenges" },
              { title: "Real-time", desc: "Instant gameplay" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="glass-panel p-6 rounded-xl text-center cursor-default"
              >
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};
