import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, total_games, wins, losses, draws, points")
        .order("points", { ascending: false })
        .order("wins", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6 game-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-panel">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl glow-text flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top players ranked by points and wins</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No players yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-panel p-4 rounded-lg ${
                        index < 3 ? "border-2 border-primary/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">{getRankIcon(index)}</div>
                        
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{player.username}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>Games: {player.total_games}</span>
                            <span className="text-green-500">W: {player.wins}</span>
                            <span className="text-red-500">L: {player.losses}</span>
                            <span className="text-yellow-500">D: {player.draws}</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className="text-2xl font-bold text-primary">{player.points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;