import { useState } from "react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { GameUI } from "@/components/chess/GameUI";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Game = () => {
  const navigate = useNavigate();
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="group hover:bg-card/40"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Menu
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <ChessBoard 
              selectedSquare={selectedSquare}
              onSquareClick={setSelectedSquare}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GameUI />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Game;
