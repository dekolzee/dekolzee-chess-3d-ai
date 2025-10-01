import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { motion } from "framer-motion";

export const GameUI = () => {
  return (
    <div className="space-y-4">
      {/* Player Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">You</p>
                <Badge variant="secondary" className="text-xs">White</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">10:00</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Move History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-panel p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Move History
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-center py-8">Game starting...</p>
          </div>
        </Card>
      </motion.div>

      {/* Opponent Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">AI Opponent</p>
                <Badge variant="secondary" className="text-xs">Black</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">10:00</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Game Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-panel p-6">
          <h3 className="font-semibold mb-4">Game Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Moves</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Captures</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
