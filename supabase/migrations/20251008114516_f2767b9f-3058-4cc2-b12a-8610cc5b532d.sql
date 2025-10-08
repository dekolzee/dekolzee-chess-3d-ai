-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  elo_rating INTEGER DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  games_drawn INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_player_id UUID REFERENCES public.profiles(id),
  black_player_id UUID REFERENCES public.profiles(id),
  game_state JSONB NOT NULL DEFAULT '{"pieces": [], "currentTurn": "white", "moveHistory": [], "capturedPieces": {"white": [], "black": []}}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'abandoned')),
  winner TEXT CHECK (winner IN ('white', 'black', 'draw', NULL)),
  time_control INTEGER DEFAULT 600,
  white_time_remaining INTEGER,
  black_time_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

CREATE POLICY "Users can create games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = white_player_id OR auth.uid() = black_player_id);

CREATE POLICY "Players can update their games"
  ON public.games FOR UPDATE
  USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

-- Enable realtime for games
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substring(NEW.id::text from 1 for 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();