-- Retrat.ai Database Schema v1.1
-- Updates for Plans v1.1 and enhanced usage tracking

-- Update users table to support new plans
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('free', 'pro', 'creator', 'studio'));

-- Update usage table for new credit system
ALTER TABLE public.usage 
ADD COLUMN IF NOT EXISTS premium_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS period_start DATE DEFAULT (date_trunc('month', NOW()))::date,
ADD COLUMN IF NOT EXISTS period_end DATE DEFAULT (date_trunc('month', NOW()) + interval '1 month' - interval '1 day')::date;

-- Rename generation_count to std_used for clarity
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage' AND column_name = 'generation_count') THEN
    ALTER TABLE public.usage RENAME COLUMN generation_count TO std_used;
  END IF;
END $$;

-- Update quota_limit to std_credits for consistency
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage' AND column_name = 'quota_limit') THEN
    ALTER TABLE public.usage RENAME COLUMN quota_limit TO std_credits;
  END IF;
END $$;

-- Add billing table for subscription management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'pro', 'creator', 'studio')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add add-ons purchases table
CREATE TABLE IF NOT EXISTS public.addon_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('premium_extra', 'std_extra_100')),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  applied_to_month TEXT NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for addon purchases
CREATE POLICY "Users can view own addon purchases" ON public.addon_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addon purchases" ON public.addon_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to get user usage stats (updated for v1.1)
CREATE OR REPLACE FUNCTION get_user_usage_stats_v11(p_user_id UUID)
RETURNS TABLE(
  current_month TEXT,
  std_used INTEGER,
  std_credits INTEGER,
  premium_used INTEGER,
  premium_included INTEGER,
  can_generate_std boolean,
  can_generate_premium boolean,
  plan TEXT
) AS $$
DECLARE
  current_month_str TEXT;
  user_plan TEXT;
  plan_std_credits INTEGER;
  plan_premium_included INTEGER;
BEGIN
  current_month_str := to_char(NOW(), 'YYYY-MM');
  
  -- Get user plan
  SELECT users.plan INTO user_plan
  FROM public.users
  WHERE users.id = p_user_id;
  
  -- Get plan limits based on pricing v1.1
  plan_std_credits := CASE user_plan
    WHEN 'free' THEN 15
    WHEN 'pro' THEN 120
    WHEN 'creator' THEN 300
    WHEN 'studio' THEN 600
    ELSE 15
  END;
  
  plan_premium_included := CASE user_plan
    WHEN 'free' THEN 0
    WHEN 'pro' THEN 0
    WHEN 'creator' THEN 5
    WHEN 'studio' THEN 20
    ELSE 0
  END;
  
  RETURN QUERY
  SELECT 
    current_month_str,
    COALESCE(u.std_used, 0) as std_used,
    plan_std_credits as std_credits,
    COALESCE(u.premium_used, 0) as premium_used,
    plan_premium_included as premium_included,
    (COALESCE(u.std_used, 0) < plan_std_credits) as can_generate_std,
    (COALESCE(u.premium_used, 0) < plan_premium_included OR user_plan = 'pro') as can_generate_premium,
    user_plan
  FROM public.users
  LEFT JOIN public.usage u ON u.user_id = users.id AND u.month = current_month_str
  WHERE users.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_user_month ON public.addon_purchases(user_id, applied_to_month);

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
