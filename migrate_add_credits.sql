-- Add credits column to user_stats table
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 2;

-- Update existing users to have 2 initial credits
UPDATE public.user_stats SET credits = 2 WHERE credits IS NULL;

-- Add comment
COMMENT ON COLUMN public.user_stats.credits IS 'Number of post generation credits available to the user';

-- Create function to ensure new users get 2 initial credits
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, generation_count, premium_until, credits, last_generated_at, created_at, updated_at)
  VALUES (
    NEW.id, 
    0, 
    NULL, 
    2, -- Initial credits for new users
    NOW(), 
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add credits for new users (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_add_credits'
  ) THEN
    CREATE TRIGGER on_auth_user_created_add_credits
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_credits();
  END IF;
END
$$; 