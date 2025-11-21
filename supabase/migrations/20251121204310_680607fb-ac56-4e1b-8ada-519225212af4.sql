-- Drop existing policies
DROP POLICY IF EXISTS "Users can view games" ON games;
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Players can update their games" ON games;

-- Create comprehensive policy for viewing games
CREATE POLICY "Users can view games" 
ON games 
FOR SELECT 
USING (
  -- Can view own games (as white or black player)
  auth.uid() = white_player_id 
  OR auth.uid() = black_player_id 
  -- Can view waiting multiplayer games with game codes (for joining)
  OR (game_code IS NOT NULL AND status = 'waiting' AND mode = 'multiplayer')
);

-- Allow users to create games where they are the white player
CREATE POLICY "Users can create games" 
ON games 
FOR INSERT 
WITH CHECK (
  auth.uid() = white_player_id
);

-- Allow players to update their games or join waiting games
CREATE POLICY "Players can update their games" 
ON games 
FOR UPDATE 
USING (
  -- Own games
  auth.uid() = white_player_id 
  OR auth.uid() = black_player_id
  -- Or joining as black player
  OR (black_player_id IS NULL AND status = 'waiting' AND game_code IS NOT NULL AND mode = 'multiplayer')
);

-- Create index for faster game code lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code) WHERE game_code IS NOT NULL;