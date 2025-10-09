import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Users, Bot, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Lobby = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gameCode, setGameCode] = useState("");
  const [myGameCode, setMyGameCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGame = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const code = generateGameCode();
      const { data, error } = await supabase
        .from("games")
        .insert({
          white_player_id: user.id,
          game_code: code,
          status: "waiting",
          mode: "multiplayer"
        })
        .select()
        .single();

      if (error) throw error;

      setMyGameCode(code);
      toast({
        title: "Game Created!",
        description: `Share code: ${code}`,
      });

      // Navigate to game after short delay
      setTimeout(() => {
        navigate(`/game/${data.id}`);
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async () => {
    if (!user || !gameCode) return;
    
    setLoading(true);
    try {
      // Find game with code
      const { data: game, error: findError } = await supabase
        .from("games")
        .select("*")
        .eq("game_code", gameCode.toUpperCase())
        .eq("status", "waiting")
        .single();

      if (findError || !game) {
        throw new Error("Game not found or already started");
      }

      // Join as black player
      const { error: updateError } = await supabase
        .from("games")
        .update({ 
          black_player_id: user.id,
          status: "active"
        })
        .eq("id", game.id);

      if (updateError) throw updateError;

      toast({
        title: "Joined Game!",
        description: "Starting match...",
      });

      navigate(`/game/${game.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playWithAI = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .insert({
          white_player_id: user.id,
          status: "active",
          mode: "ai"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "AI Game Started!",
        description: "Good luck!",
      });

      navigate(`/game/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(myGameCode);
    toast({
      title: "Copied!",
      description: "Game code copied to clipboard",
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
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

        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Game Lobby
            </h1>
            <p className="text-muted-foreground">Choose your game mode</p>
          </motion.div>

          {/* Play with AI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-panel p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Play with AI</h2>
                  <p className="text-sm text-muted-foreground">Challenge the AI opponent</p>
                </div>
              </div>
              <Button
                onClick={playWithAI}
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent to-accent-glow hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start AI Game
              </Button>
            </Card>
          </motion.div>

          {/* Create Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-panel p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create Game</h2>
                  <p className="text-sm text-muted-foreground">Get a code and share with a friend</p>
                </div>
              </div>
              
              {myGameCode && (
                <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Game Code</p>
                      <Badge variant="default" className="text-2xl font-mono px-4 py-2">
                        {myGameCode}
                      </Badge>
                    </div>
                    <Button onClick={copyCode} variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                onClick={createGame}
                disabled={loading}
                className="w-full"
              >
                Create New Game
              </Button>
            </Card>
          </motion.div>

          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">Join Game</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono uppercase"
                  maxLength={6}
                />
                <Button
                  onClick={joinGame}
                  disabled={loading || !gameCode}
                  variant="outline"
                  className="w-full"
                >
                  Join Game
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
