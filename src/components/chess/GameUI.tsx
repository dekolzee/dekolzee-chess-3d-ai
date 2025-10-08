import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, RotateCcw, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useChessStore } from "@/store/chessStore";

export const GameUI = () => {
  const { currentTurn, moveHistory, capturedPieces, theme, setTheme, resetGame, gameStatus, winner } = useChessStore();

  const whiteCaptured = capturedPieces.filter(p => p.color === "white");
  const blackCaptured = capturedPieces.filter(p => p.color === "black");

  return (
    <div className="space-y-4">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Board Theme</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="gap-2"
            >
              {theme === "light" ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Game Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel p-6">
          <div className="text-center space-y-3">
            {gameStatus === "checkmate" && (
              <div className="bg-gradient-to-r from-accent to-primary p-4 rounded-lg">
                <p className="text-2xl font-bold mb-1">Checkmate!</p>
                <p className="text-lg">{winner === "white" ? "⚪ White" : "⚫ Black"} wins!</p>
              </div>
            )}
            {gameStatus === "stalemate" && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl font-bold mb-1">Stalemate!</p>
                <p className="text-lg">Game is a draw</p>
              </div>
            )}
            {gameStatus === "check" && (
              <div className="bg-destructive/20 p-3 rounded-lg border-2 border-destructive animate-pulse">
                <p className="text-lg font-bold text-destructive">Check!</p>
              </div>
            )}
            {gameStatus === "active" && (
              <>
                <p className="text-sm text-muted-foreground mb-2">Current Turn</p>
                <Badge 
                  variant={currentTurn === "white" ? "default" : "secondary"}
                  className="text-lg px-6 py-2"
                >
                  {currentTurn === "white" ? "⚪ White" : "⚫ Black"}
                </Badge>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Player Info - White */}
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
                <p className="font-semibold">White Player</p>
                <Badge variant="secondary" className="text-xs">⚪</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">10:00</span>
            </div>
          </div>
          {whiteCaptured.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">Captured:</p>
              <div className="flex flex-wrap gap-1">
                {whiteCaptured.map((piece, i) => (
                  <span key={i} className="text-xs bg-destructive/20 px-2 py-1 rounded">
                    {piece.type}
                  </span>
                ))}
              </div>
            </div>
          )}
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
          <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {moveHistory.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No moves yet</p>
            ) : (
              moveHistory.map((move, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono text-xs text-accent">{index + 1}.</span>
                  <span>{move}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>

      {/* Player Info - Black */}
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
                <p className="font-semibold">Black Player</p>
                <Badge variant="secondary" className="text-xs">⚫</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">10:00</span>
            </div>
          </div>
          {blackCaptured.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">Captured:</p>
              <div className="flex flex-wrap gap-1">
                {blackCaptured.map((piece, i) => (
                  <span key={i} className="text-xs bg-destructive/20 px-2 py-1 rounded">
                    {piece.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Game Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-panel p-6">
          <Button
            onClick={resetGame}
            variant="outline"
            className="w-full game-button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};
