-- Update RLS policy to allow viewing games by game_code for joining
DROP POLICY IF EXISTS "Users can view their own games" ON games;

-- Create new policy that allows viewing own games OR games with a valid code
CREATE POLICY "Users can view games" 
ON games 
FOR SELECT 
USING (
  auth.uid() = white_player_id 
  OR auth.uid() = black_player_id 
  OR (game_code IS NOT NULL AND status = 'waiting' AND black_player_id IS NULL)
);

-- Update insert policy to be clearer
DROP POLICY IF EXISTS "Users can create games" ON games;

CREATE POLICY "Users can create games" 
ON games 
FOR INSERT 
WITH CHECK (
  auth.uid() = white_player_id 
  OR auth.uid() = black_player_id
);

-- Update policy to allow joining games
DROP POLICY IF EXISTS "Players can update their games" ON games;

CREATE POLICY "Players can update their games" 
ON games 
FOR UPDATE 
USING (
  auth.uid() = white_player_id 
  OR auth.uid() = black_player_id
  OR (black_player_id IS NULL AND status = 'waiting' AND game_code IS NOT NULL)
);