-- Subscription management tables for Retrat.ai
-- Supports Free/Pro tiers with Stripe integration

-- Subscription plans table
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  stripe_price_id TEXT UNIQUE,
  features JSONB NOT NULL DEFAULT '{}',
  quota_generations INTEGER, -- NULL = unlimited
  quota_period TEXT DEFAULT 'week', -- week, month
  max_resolution INTEGER DEFAULT 1024, -- max dimension in px
  watermark BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, incomplete
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Usage tracking
CREATE TABLE usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  generations_used INTEGER DEFAULT 0,
  quota_limit INTEGER, -- snapshot of quota at time of record
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Ensure one record per user per period
  UNIQUE(user_id, period_start, period_end)
);

-- Stripe events log for webhook debugging
CREATE TABLE stripe_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Plans are public for reading
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
  FOR SELECT USING (true);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage everything (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage usage" ON usage_records
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage stripe events" ON stripe_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_usage_records_user_period ON usage_records(user_id, period_start, period_end);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed, created_at);

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price_monthly, features, quota_generations, watermark) VALUES
('free', 'Gratuito', 'Ideal para começar', 0, '{"resolution": "1024x1024", "support": "community"}', 5, true),
('pro', 'Pro', 'Para uso profissional', 2900, '{"resolution": "2048x2048", "support": "priority", "advanced_features": true}', NULL, false);

-- Function to get current user subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  subscription_id UUID,
  plan_id TEXT,
  plan_name TEXT,
  status TEXT,
  quota_generations INTEGER,
  watermark BOOLEAN,
  current_period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    us.id,
    us.plan_id,
    sp.name,
    us.status,
    sp.quota_generations,
    sp.watermark,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- Function to check if user can generate (within quota)
CREATE OR REPLACE FUNCTION can_user_generate(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  user_sub RECORD;
  current_usage INTEGER;
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current subscription
  SELECT * INTO user_sub FROM get_user_subscription(user_uuid);

  -- If no subscription, assume free tier
  IF user_sub IS NULL THEN
    SELECT * INTO user_sub FROM subscription_plans WHERE id = 'free';
  END IF;

  -- Pro users (unlimited) can always generate
  IF user_sub.quota_generations IS NULL THEN
    RETURN true;
  END IF;

  -- Calculate current period for quota check
  period_start := date_trunc('week', now());
  period_end := period_start + INTERVAL '1 week';

  -- Get current usage
  SELECT COALESCE(generations_used, 0) INTO current_usage
  FROM usage_records
  WHERE user_id = user_uuid
  AND period_start = period_start
  AND period_end = period_end;

  -- Check if within quota
  RETURN current_usage < user_sub.quota_generations;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_user_usage(user_uuid UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
  user_quota INTEGER;
BEGIN
  -- Calculate current period
  period_start := date_trunc('week', now());
  period_end := period_start + INTERVAL '1 week';

  -- Get user quota
  SELECT quota_generations INTO user_quota
  FROM get_user_subscription(user_uuid);

  -- Insert or update usage record
  INSERT INTO usage_records (user_id, period_start, period_end, generations_used, quota_limit)
  VALUES (user_uuid, period_start, period_end, 1, user_quota)
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    generations_used = usage_records.generations_used + 1,
    updated_at = now();
END;
$$;

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_records_updated_at BEFORE UPDATE ON usage_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();