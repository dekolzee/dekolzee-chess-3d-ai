-- Fix foreign key constraints to cascade deletes properly
ALTER TABLE games 
DROP CONSTRAINT IF EXISTS games_white_player_id_fkey,
DROP CONSTRAINT IF EXISTS games_black_player_id_fkey;

ALTER TABLE games
ADD CONSTRAINT games_white_player_id_fkey 
  FOREIGN KEY (white_player_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT games_black_player_id_fkey 
  FOREIGN KEY (black_player_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Fix game_messages foreign key
ALTER TABLE game_messages
DROP CONSTRAINT IF EXISTS game_messages_user_id_fkey,
DROP CONSTRAINT IF EXISTS game_messages_game_id_fkey;

ALTER TABLE game_messages
ADD CONSTRAINT game_messages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT game_messages_game_id_fkey 
  FOREIGN KEY (game_id) 
  REFERENCES games(id) 
  ON DELETE CASCADE;

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add index for game_code lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code) WHERE game_code IS NOT NULL;