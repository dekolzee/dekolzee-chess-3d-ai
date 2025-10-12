-- Add ready states and AI hints to games table
ALTER TABLE games 
ADD COLUMN white_player_ready BOOLEAN DEFAULT false,
ADD COLUMN black_player_ready BOOLEAN DEFAULT false,
ADD COLUMN ai_hints_used INTEGER DEFAULT 0;

-- Create game_messages table for future chat functionality
CREATE TABLE game_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE game_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view messages in their games"
ON game_messages FOR SELECT
USING (
  game_id IN (
    SELECT id FROM games 
    WHERE white_player_id = auth.uid() OR black_player_id = auth.uid()
  )
);

CREATE POLICY "Players can send messages in their games"
ON game_messages FOR INSERT
WITH CHECK (
  game_id IN (
    SELECT id FROM games 
    WHERE white_player_id = auth.uid() OR black_player_id = auth.uid()
  )
);