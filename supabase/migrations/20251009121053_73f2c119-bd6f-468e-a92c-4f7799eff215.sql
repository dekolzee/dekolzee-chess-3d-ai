-- Add game_code to games table for matchmaking
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_code text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code);

-- Add mode column to distinguish between multiplayer and AI games
ALTER TABLE games ADD COLUMN IF NOT EXISTS mode text DEFAULT 'multiplayer' CHECK (mode IN ('multiplayer', 'ai'));