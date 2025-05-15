-- Create table for storing user post generations
CREATE TABLE IF NOT EXISTS public.user_generations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) NOT NULL,
  toxicity_level INTEGER NOT NULL,
  topic TEXT,
  tones TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Add indexes
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_generations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own generations
CREATE POLICY select_own_generations ON public.user_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert only their own generations
CREATE POLICY insert_own_generations ON public.user_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary privileges
GRANT SELECT, INSERT ON public.user_generations TO authenticated;
GRANT USAGE ON SEQUENCE public.user_generations_id_seq TO authenticated;

-- Add an index for faster lookup
CREATE INDEX idx_user_generations_user_id ON public.user_generations(user_id);
CREATE INDEX idx_user_generations_created_at ON public.user_generations(created_at DESC); 