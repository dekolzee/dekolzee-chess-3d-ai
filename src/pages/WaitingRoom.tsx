import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, User, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function WaitingRoom() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameCode, setGameCode] = useState("");
  const [whitePlayer, setWhitePlayer] = useState<any>(null);
  const [blackPlayer, setBlackPlayer] = useState<any>(null);
  const [whiteReady, setWhiteReady] = useState(false);
  const [blackReady, setBlackReady] = useState(false);
  const [isWhite, setIsWhite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const [showCode, setShowCode] = useState(true);

  useEffect(() => {
    if (!user || !gameId) {
      navigate("/lobby");
      return;
    }

    loadGameData();
    
    const channel = supabase
      .channel(`waiting-room-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          const game = payload.new;
          setWhiteReady(game.white_player_ready);
          setBlackReady(game.black_player_ready);

          // When second player joins, keep code visible and reload profiles
          if (game.black_player_id && !blackPlayer) {
            setShowCode(true);
            loadGameData();
          }

          // Hide code once both players are in
          if (game.white_player_id && game.black_player_id) {
            setShowCode(false);
          }
          
          // Start game when both players are ready
          if (game.white_player_ready && game.black_player_ready && game.status === 'active') {
            toast.success("Both players ready! Starting game...");
            setTimeout(() => navigate(`/game/${gameId}`), 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, user, navigate, blackPlayer]);

  const loadGameData = async () => {
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (!game) {
      toast.error("Game not found");
      navigate("/lobby");
      return;
    }

    setGameCode(game.game_code || "");
    setWhiteReady(game.white_player_ready || false);
    setBlackReady(game.black_player_ready || false);
    setIsWhite(game.white_player_id === user?.id);

    if (game.white_player_id) {
      const { data: whiteProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", game.white_player_id)
        .single();
      setWhitePlayer(whiteProfile);
    }

    if (game.black_player_id) {
      const { data: blackProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", game.black_player_id)
        .single();
      setBlackPlayer(blackProfile);
    }
  };

  const handleReady = async () => {
    const field = isWhite ? 'white_player_ready' : 'black_player_ready';
    const newReadyState = !myReady;

    const { error } = await supabase
      .from("games")
      .update({ 
        [field]: newReadyState,
        status: 'active' // Activate game when someone clicks ready
      })
      .eq("id", gameId);

    if (error) {
      toast.error("Failed to update ready status");
      return;
    }

    setMyReady(newReadyState);
    toast.success(newReadyState ? "You are ready!" : "Ready status removed");
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    toast.success("Game code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 backdrop-blur-sm bg-card/95 border-2 border-primary/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Waiting Room
            </h1>
            {showCode && !blackPlayer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-muted-foreground">Game Code:</span>
                  <code className="text-2xl font-mono font-bold text-primary">{gameCode}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyGameCode}
                    className="ml-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Share this code with your opponent</p>
              </motion.div>
            )}
            {whitePlayer && blackPlayer && (
              <p className="text-lg text-primary font-semibold">Both players connected!</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* White Player */}
            <motion.div
              animate={{
                scale: whiteReady ? 1.05 : 1,
                borderColor: whiteReady ? "rgb(var(--primary))" : "rgb(var(--border))"
              }}
              className="p-6 rounded-lg border-2 bg-background/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">White Player</h3>
              </div>
              {whitePlayer ? (
                <div className="flex items-center gap-3">
                  {whitePlayer.avatar_url ? (
                    <img src={whitePlayer.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full" />
                  ) : (
                    <User className="h-12 w-12 p-2 rounded-full bg-muted" />
                  )}
                  <div>
                    <p className="font-semibold">{whitePlayer.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {whiteReady ? "✓ Ready" : "Waiting..."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Waiting for player...</p>
              )}
            </motion.div>

            {/* Black Player */}
            <motion.div
              animate={{
                scale: blackReady ? 1.05 : 1,
                borderColor: blackReady ? "rgb(var(--primary))" : "rgb(var(--border))"
              }}
              className="p-6 rounded-lg border-2 bg-background/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-semibold">Black Player</h3>
              </div>
              {blackPlayer ? (
                <div className="flex items-center gap-3">
                  {blackPlayer.avatar_url ? (
                    <img src={blackPlayer.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full" />
                  ) : (
                    <User className="h-12 w-12 p-2 rounded-full bg-muted" />
                  )}
                  <div>
                    <p className="font-semibold">{blackPlayer.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {blackReady ? "✓ Ready" : "Waiting..."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Waiting for player...</p>
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              onClick={handleReady}
              disabled={!whitePlayer || !blackPlayer}
              className="w-full text-lg"
              variant={myReady ? "outline" : "default"}
            >
              {myReady ? "✓ Ready - Click to Unready" : "Play"}
            </Button>

            {whiteReady && blackReady && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-primary font-semibold"
              >
                Starting game...
              </motion.div>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate("/lobby")}
              className="w-full"
            >
              Back to Lobby
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
