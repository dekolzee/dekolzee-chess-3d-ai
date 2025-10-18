import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, RotateCcw, Sun, Moon, Undo2, Redo2, Settings as SettingsIcon, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useChessStore } from "@/store/chessStore";
import { Settings } from "@/components/game/Settings";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { soundManager } from "@/utils/sounds";
import { pieceSoundManager } from "@/utils/piecesSounds";

interface GameUIProps {
  gameId?: string;
  whitePlayerUsername?: string;
  blackPlayerUsername?: string;
  playerColor?: "white" | "black";
  aiHintsUsed?: number;
  isMultiplayer?: boolean;
}

export const GameUI = ({ 
  gameId, 
  whitePlayerUsername, 
  blackPlayerUsername, 
  playerColor,
  aiHintsUsed = 0,
  isMultiplayer = false 
}: GameUIProps) => {
  const { currentTurn, moveHistory, capturedPieces, theme, setTheme, resetGame, gameStatus, winner, undo, redo, canUndo, canRedo, pieces } = useChessStore();
  const [hints, setHints] = useState("");
  const [loadingHints, setLoadingHints] = useState(false);
  const [hintsDialogOpen, setHintsDialogOpen] = useState(false);
  const [currentHintsUsed, setCurrentHintsUsed] = useState(aiHintsUsed);

  const capturedPiecesArray = Array.isArray(capturedPieces) ? capturedPieces : [];
  const whiteCaptured = capturedPiecesArray.filter(p => p.color === "white");
  const blackCaptured = capturedPiecesArray.filter(p => p.color === "black");

  const handleGetHint = async () => {
    if (currentHintsUsed >= 2) {
      toast.error("You've used all your hints (2/2)");
      return;
    }

    setLoadingHints(true);
    try {
      const { data, error } = await supabase.functions.invoke('chess-hint-assistant', {
        body: {
          gameState: {
            pieces,
            currentTurn,
            moveHistory
          },
          playerColor
        }
      });

      if (error) throw error;

      setHints(data.hints);
      setHintsDialogOpen(true);

      // Update hints used in database
      if (gameId) {
        const { error: updateError } = await supabase
          .from('games')
          .update({ ai_hints_used: currentHintsUsed + 1 })
          .eq('id', gameId);

        if (!updateError) {
          setCurrentHintsUsed(prev => prev + 1);
          toast.success(`Hint received! (${currentHintsUsed + 1}/2 used)`);
        }
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Failed to get hint');
    } finally {
      setLoadingHints(false);
    }
  };

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

      {/* Opponent Info - Only show in multiplayer */}
      {isMultiplayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass-panel p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Playing as</p>
              <p className="font-bold text-lg">
                {playerColor === "white" ? "⚪ White" : "⚫ Black"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">vs</p>
              <p className="font-semibold">
                {playerColor === "white" ? blackPlayerUsername : whitePlayerUsername}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

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
        <Card className="glass-panel p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={undo}
                variant="outline"
                disabled={!canUndo()}
                className="game-button"
                size="sm"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                disabled={!canRedo()}
                className="game-button"
                size="sm"
              >
                <Redo2 className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full game-button" size="sm">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Settings />
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={resetGame}
              variant="outline"
              className="w-full game-button"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Game
            </Button>

            {/* AI Hint Assistant */}
            {gameId && (
              <Dialog open={hintsDialogOpen} onOpenChange={setHintsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleGetHint}
                    variant="outline"
                    className="w-full game-button"
                    size="sm"
                    disabled={currentHintsUsed >= 2 || loadingHints}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    AI Hint ({currentHintsUsed}/2)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Chess Assistant</DialogTitle>
                    <DialogDescription>
                      Here are some suggested moves for your position
                    </DialogDescription>
                  </DialogHeader>
                  <div className="whitespace-pre-wrap text-sm">{hints}</div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
