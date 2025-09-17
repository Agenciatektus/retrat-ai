-- Utility functions for Retrat.ai
-- Run this in your Supabase SQL editor after the main schema

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_month TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.usage (user_id, month, generation_count, quota_limit)
  VALUES (p_user_id, p_month, 1, 5)
  ON CONFLICT (user_id, month)
  DO UPDATE SET 
    generation_count = usage.generation_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can generate (quota check)
CREATE OR REPLACE FUNCTION can_user_generate(p_user_id UUID)
RETURNS boolean AS $$
DECLARE
  user_plan TEXT;
  current_month TEXT;
  current_usage INTEGER;
  quota_limit INTEGER;
BEGIN
  -- Get user plan
  SELECT plan INTO user_plan
  FROM public.users
  WHERE id = p_user_id;
  
  -- Pro users have unlimited generations
  IF user_plan = 'pro' THEN
    RETURN true;
  END IF;
  
  -- Check free user quota
  current_month := to_char(NOW(), 'YYYY-MM');
  
  SELECT generation_count, quota_limit
  INTO current_usage, quota_limit
  FROM public.usage
  WHERE user_id = p_user_id AND month = current_month;
  
  -- If no usage record exists, user can generate
  IF current_usage IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under quota
  RETURN current_usage < quota_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id UUID)
RETURNS TABLE(
  current_month TEXT,
  generation_count INTEGER,
  quota_limit INTEGER,
  can_generate boolean,
  plan TEXT
) AS $$
DECLARE
  current_month_str TEXT;
BEGIN
  current_month_str := to_char(NOW(), 'YYYY-MM');
  
  RETURN QUERY
  SELECT 
    current_month_str,
    COALESCE(u.generation_count, 0) as generation_count,
    COALESCE(u.quota_limit, 5) as quota_limit,
    can_user_generate(p_user_id) as can_generate,
    users.plan
  FROM public.users
  LEFT JOIN public.usage u ON u.user_id = users.id AND u.month = current_month_str
  WHERE users.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
