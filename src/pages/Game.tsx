import { Board2D } from "@/components/chess/Board2D";
import { GameUI } from "@/components/chess/GameUI";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useChessStore } from "@/store/chessStore";
import { useAuth } from "@/hooks/useAuth";
import { soundManager } from "@/utils/sounds";
import { pieceSoundManager } from "@/utils/piecesSounds";
import { musicManager } from "@/utils/backgroundMusic";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Game = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [gameMode, setGameMode] = useState<"multiplayer" | "ai">("multiplayer");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [whitePlayerUsername, setWhitePlayerUsername] = useState("");
  const [blackPlayerUsername, setBlackPlayerUsername] = useState("");
  const [aiHintsUsed, setAiHintsUsed] = useState(0);
  const { pieces, isValidMove, movePiece, theme, currentTurn, gameStatus, resetGame } = useChessStore();

  // Load game from database
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!gameId || !user) return;

    const loadGame = async () => {
      const { data: game, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error || !game) {
        toast({
          title: "Error",
          description: "Game not found",
          variant: "destructive",
        });
        navigate("/lobby");
        return;
      }

      // For multiplayer, check if both players have joined
      if (game.mode === "multiplayer" && game.status === "waiting") {
        toast({
          title: "Waiting for Opponent",
          description: "The other player hasn't joined yet",
        });
        navigate("/lobby");
        return;
      }

      setGameMode((game.mode as "multiplayer" | "ai") || "multiplayer");
      setAiDifficulty((game.ai_difficulty as "easy" | "medium" | "hard") || "medium");
      setAiHintsUsed(game.ai_hints_used || 0);
      
      // Start background music
      musicManager.play();
      
      // Determine player color
      if (game.white_player_id === user.id) {
        setMyColor("white");
      } else if (game.black_player_id === user.id) {
        setMyColor("black");
      }

      // Load player usernames for multiplayer
      if (game.mode === "multiplayer") {
        if (game.white_player_id) {
          const { data: whiteProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", game.white_player_id)
            .single();
          if (whiteProfile) setWhitePlayerUsername(whiteProfile.username);
        }
        if (game.black_player_id) {
          const { data: blackProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", game.black_player_id)
            .single();
          if (blackProfile) setBlackPlayerUsername(blackProfile.username);
        }
      }

      // Load game state if exists, otherwise reset to initial position
      if (game.game_state && typeof game.game_state === 'object') {
        const state = game.game_state as any;
        if (state.pieces && Array.isArray(state.pieces) && state.pieces.length > 0) {
          useChessStore.setState({
            pieces: state.pieces,
            currentTurn: state.currentTurn || "white",
            moveHistory: state.moveHistory || [],
            capturedPieces: Array.isArray(state.capturedPieces) ? state.capturedPieces : [],
            gameStatus: state.gameStatus || "active",
            winner: state.winner || null,
          });
        } else {
          // Initialize new game with starting position
          useChessStore.getState().resetGame();
        }
      } else {
        // Initialize new game with starting position
        useChessStore.getState().resetGame();
      }
    };

    loadGame();
  }, [gameId, user, authLoading, navigate]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const newGame = payload.new as any;
          if (newGame.game_state && newGame.game_state.pieces) {
            const state = newGame.game_state;
            useChessStore.setState({
              pieces: state.pieces,
              currentTurn: state.currentTurn || "white",
              moveHistory: state.moveHistory || [],
              capturedPieces: Array.isArray(state.capturedPieces) ? state.capturedPieces : [],
              gameStatus: state.gameStatus || "active",
              winner: state.winner || null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Save game state to database after each move
  const saveGameState = useCallback(async () => {
    if (!gameId) return;

    const state = useChessStore.getState();
    await supabase
      .from("games")
      .update({
        game_state: JSON.parse(JSON.stringify({
          pieces: state.pieces,
          currentTurn: state.currentTurn,
          moveHistory: state.moveHistory,
          capturedPieces: state.capturedPieces,
          gameStatus: state.gameStatus,
          winner: state.winner,
        })),
        status: state.gameStatus === "checkmate" || state.gameStatus === "stalemate" ? "completed" : "active",
        winner: state.winner,
      })
      .eq("id", gameId);
  }, [gameId]);

  // AI move logic
  const makeAIMove = useCallback(async () => {
    if (gameMode !== "ai" || currentTurn !== "black" || isWaitingForAI) return;

    setIsWaitingForAI(true);
    try {
      const state = useChessStore.getState();
      const { data, error } = await supabase.functions.invoke('chess-ai-move', {
        body: { 
          gameState: {
            pieces: state.pieces,
            currentTurn: state.currentTurn,
            moveHistory: state.moveHistory,
          },
          difficulty: aiDifficulty,
        }
      });

      if (error) throw error;

      if (data.useRandom) {
        // Fallback: make random valid move
        const blackPieces = state.pieces.filter(p => p.color === "black");
        for (const piece of blackPieces) {
          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              if (isValidMove(piece.position, [x, y])) {
                setTimeout(() => {
                  movePiece(piece.position, [x, y]);
                  saveGameState();
                }, 500);
                setIsWaitingForAI(false);
                return;
              }
            }
          }
        }
      } else if (data.from && data.to) {
        setTimeout(() => {
          movePiece(data.from, data.to);
          saveGameState();
        }, 500);
      }
    } catch (error: any) {
      console.error("AI move error:", error);
      toast({
        title: "AI Error",
        description: "AI couldn't make a move",
        variant: "destructive",
      });
    } finally {
      setIsWaitingForAI(false);
    }
  }, [gameMode, currentTurn, isWaitingForAI, movePiece, saveGameState, isValidMove]);

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameMode === "ai" && currentTurn === "black" && gameStatus === "active") {
      makeAIMove();
    }
  }, [currentTurn, gameMode, gameStatus, makeAIMove]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const validMoves: [number, number][] = [];
  if (selectedSquare) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (isValidMove(selectedSquare, [x, y])) {
          validMoves.push([x, y]);
        }
      }
    }
  }

  const handleSquareClick = async (x: number, y: number) => {
    // Prevent moves if game is over
    if (gameStatus === "checkmate" || gameStatus === "stalemate") return;

    // In multiplayer, only allow moves if it's your turn
    if (gameMode === "multiplayer" && myColor && myColor !== currentTurn) {
      toast({
        title: "Not Your Turn",
        description: "Wait for your opponent",
      });
      return;
    }

    // In AI mode, only allow white player moves
    if (gameMode === "ai" && currentTurn !== "white") return;
    
    if (selectedSquare) {
      const piece = pieces.find(
        p => p.position[0] === selectedSquare[0] && p.position[1] === selectedSquare[1]
      );
      
      if (piece && isValidMove(selectedSquare, [x, y])) {
        const capturedPiece = pieces.find(p => p.position[0] === x && p.position[1] === y);
        
        movePiece(selectedSquare, [x, y]);
        
        // Play piece-specific sound
        pieceSoundManager.playPieceMove(piece);
        
        // Play game event sounds
        const newGameStatus = useChessStore.getState().gameStatus;
        if (newGameStatus === "check" || newGameStatus === "checkmate") {
          soundManager.playCheck();
        } else if (capturedPiece) {
          soundManager.playCapture();
        }
        
        // Save to database
        await saveGameState();
        
        setSelectedSquare(null);
        return;
      }
    }

    const pieceAtSquare = pieces.find(p => p.position[0] === x && p.position[1] === y);
    if (pieceAtSquare) {
      // In multiplayer, only select own pieces
      if (gameMode === "multiplayer" && myColor && pieceAtSquare.color !== myColor) {
        return;
      }
      // In AI mode, only select white pieces
      if (gameMode === "ai" && pieceAtSquare.color !== "white") {
        return;
      }
      setSelectedSquare([x, y]);
    } else {
      setSelectedSquare(null);
    }
  };

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
            onClick={() => navigate("/lobby")}
            variant="ghost"
            className="group hover:bg-card/40"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Lobby
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Board2D 
              pieces={pieces}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              onSquareClick={handleSquareClick}
              theme={theme}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GameUI 
              gameId={gameId}
              whitePlayerUsername={whitePlayerUsername}
              blackPlayerUsername={blackPlayerUsername}
              playerColor={myColor || undefined}
              aiHintsUsed={aiHintsUsed}
              isMultiplayer={gameMode === "multiplayer"}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Game;
