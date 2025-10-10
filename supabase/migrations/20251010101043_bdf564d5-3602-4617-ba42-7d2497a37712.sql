-- Update profiles table to track game statistics for leaderboard
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_games INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Add AI difficulty column to games table
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS ai_difficulty TEXT DEFAULT 'medium' CHECK (ai_difficulty IN ('easy', 'medium', 'hard'));

-- Create a function to update player stats after game completion
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update white player stats
    IF NEW.white_player_id IS NOT NULL THEN
      UPDATE public.profiles
      SET 
        total_games = total_games + 1,
        wins = CASE WHEN NEW.winner = 'white' THEN wins + 1 ELSE wins END,
        losses = CASE WHEN NEW.winner = 'black' THEN losses + 1 ELSE losses END,
        draws = CASE WHEN NEW.winner IS NULL THEN draws + 1 ELSE draws END,
        points = points + 
          CASE 
            WHEN NEW.winner = 'white' THEN 10
            WHEN NEW.winner IS NULL THEN 5
            ELSE 0
          END
      WHERE id = NEW.white_player_id;
    END IF;
    
    -- Update black player stats (only for multiplayer)
    IF NEW.black_player_id IS NOT NULL AND NEW.mode = 'multiplayer' THEN
      UPDATE public.profiles
      SET 
        total_games = total_games + 1,
        wins = CASE WHEN NEW.winner = 'black' THEN wins + 1 ELSE wins END,
        losses = CASE WHEN NEW.winner = 'white' THEN losses + 1 ELSE losses END,
        draws = CASE WHEN NEW.winner IS NULL THEN draws + 1 ELSE draws END,
        points = points + 
          CASE 
            WHEN NEW.winner = 'black' THEN 10
            WHEN NEW.winner IS NULL THEN 5
            ELSE 0
          END
      WHERE id = NEW.black_player_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update stats
CREATE TRIGGER on_game_completed
  AFTER UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();