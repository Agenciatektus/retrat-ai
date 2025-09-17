-- Migration: Plans v1.1 - Update database schema for new pricing system
-- Based on system-update-plans.md specification

-- First, update the subscription_plans table to support v1.1 fields
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS std_credits INTEGER,
ADD COLUMN IF NOT EXISTS premium_included INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';

-- Update usage_records table to support separate standard and premium tracking
ALTER TABLE usage_records
ADD COLUMN IF NOT EXISTS std_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS premium_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';

-- Create new add_on_purchases table for tracking premium add-ons
CREATE TABLE IF NOT EXISTS addon_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addon_type TEXT NOT NULL, -- 'premium' or 'std_pack'
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- in cents
  total_amount INTEGER NOT NULL, -- in cents
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  expires_at TIMESTAMP WITH TIME ZONE, -- for unused credits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,

  -- Index for fast lookups
  CONSTRAINT valid_addon_type CHECK (addon_type IN ('premium', 'std_pack'))
);

-- RLS for addon_purchases
ALTER TABLE addon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addon purchases" ON addon_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage addon purchases" ON addon_purchases
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert/Update v1.1 plans
INSERT INTO subscription_plans (id, name, description, price_monthly, features, quota_generations, quota_period, max_resolution, watermark, std_credits, premium_included, version) VALUES
  ('free', 'Free', 'Plano gratuito com recursos básicos', 0,
   '{"features": ["Standard only", "Resolução padrão com marca d''água"]}',
   15, 'month', 1024, true, 15, 0, '1.1'),

  ('pro', 'Pro', 'Plano profissional com mais recursos', 2900,
   '{"features": ["HD sem marca d''água", "Fundo transparente", "Variações avançadas"], "premium_policy": "pay_per_use"}',
   120, 'month', 2048, false, 120, 0, '1.1'),

  ('creator', 'Creator', 'Para criadores de conteúdo', 5900,
   '{"features": ["HD", "Fundo transparente", "Exportações em lote", "Suporte prioritário"]}',
   300, 'month', 2048, false, 300, 5, '1.1'),

  ('studio', 'Studio', 'Plano premium para estúdios', 9900,
   '{"features": ["HD+", "Presets por projeto", "Variações em série", "Processamento prioritário", "Suporte dedicado"]}',
   600, 'month', 4096, false, 600, 20, '1.1')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  quota_generations = EXCLUDED.quota_generations,
  std_credits = EXCLUDED.std_credits,
  premium_included = EXCLUDED.premium_included,
  version = EXCLUDED.version,
  updated_at = now();

-- Update legacy subscriptions to have proper std_credits mapping
UPDATE user_subscriptions SET plan_id = 'free' WHERE plan_id NOT IN ('free', 'pro', 'creator', 'studio');

-- Function to get current user credits (v1.1)
CREATE OR REPLACE FUNCTION get_user_credits_v11(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  plan_id TEXT,
  std_credits_limit INTEGER,
  premium_credits_limit INTEGER,
  std_credits_used INTEGER,
  premium_credits_used INTEGER,
  std_credits_remaining INTEGER,
  premium_credits_remaining INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL SECURITY DEFINER AS $$
  WITH user_plan AS (
    SELECT
      COALESCE(us.plan_id, 'free') as plan_id,
      COALESCE(sp.std_credits, 15) as std_limit,
      COALESCE(sp.premium_included, 0) as premium_limit
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE u.id = user_uuid
    ORDER BY us.created_at DESC
    LIMIT 1
  ),
  current_period AS (
    SELECT
      date_trunc('month', now()) as period_start,
      date_trunc('month', now()) + INTERVAL '1 month' as period_end
  ),
  current_usage AS (
    SELECT
      COALESCE(ur.std_credits_used, ur.generations_used, 0) as std_used,
      COALESCE(ur.premium_credits_used, 0) as premium_used
    FROM current_period cp
    LEFT JOIN usage_records ur ON ur.user_id = user_uuid
      AND ur.period_start = cp.period_start
      AND ur.period_end = cp.period_end
  )

  SELECT
    up.plan_id,
    up.std_limit,
    up.premium_limit,
    cu.std_used,
    cu.premium_used,
    GREATEST(0, up.std_limit - cu.std_used) as std_remaining,
    GREATEST(0, up.premium_limit - cu.premium_used) as premium_remaining,
    cp.period_start,
    cp.period_end
  FROM user_plan up, current_period cp, current_usage cu;
$$;

-- Function to check if user can generate (v1.1)
CREATE OR REPLACE FUNCTION can_user_generate_v11(
  user_uuid UUID DEFAULT auth.uid(),
  generation_type TEXT DEFAULT 'standard',
  count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  credits RECORD;
BEGIN
  SELECT * INTO credits FROM get_user_credits_v11(user_uuid);

  IF generation_type = 'standard' THEN
    RETURN credits.std_credits_remaining >= count;
  ELSIF generation_type = 'premium' THEN
    RETURN credits.premium_credits_remaining >= count;
  END IF;

  RETURN false;
END;
$$;

-- Function to debit user credits (v1.1)
CREATE OR REPLACE FUNCTION debit_user_credits_v11(
  user_uuid UUID DEFAULT auth.uid(),
  generation_type TEXT DEFAULT 'standard',
  count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
  credits RECORD;
BEGIN
  -- Get current period
  period_start := date_trunc('month', now());
  period_end := period_start + INTERVAL '1 month';

  -- Check if user can generate
  IF NOT can_user_generate_v11(user_uuid, generation_type, count) THEN
    RETURN false;
  END IF;

  -- Insert or update usage record
  IF generation_type = 'standard' THEN
    INSERT INTO usage_records (user_id, period_start, period_end, std_credits_used, version)
    VALUES (user_uuid, period_start, period_end, count, '1.1')
    ON CONFLICT (user_id, period_start, period_end)
    DO UPDATE SET
      std_credits_used = usage_records.std_credits_used + count,
      updated_at = now();
  ELSIF generation_type = 'premium' THEN
    INSERT INTO usage_records (user_id, period_start, period_end, premium_credits_used, version)
    VALUES (user_uuid, period_start, period_end, count, '1.1')
    ON CONFLICT (user_id, period_start, period_end)
    DO UPDATE SET
      premium_credits_used = usage_records.premium_credits_used + count,
      updated_at = now();
  END IF;

  RETURN true;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_addon_purchases_user_id ON addon_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_status ON addon_purchases(status, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_version ON usage_records(version, user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_version ON subscription_plans(version);

-- Update trigger for addon_purchases
CREATE TRIGGER update_addon_purchases_updated_at BEFORE UPDATE ON addon_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON usage_records TO authenticated;
GRANT SELECT ON addon_purchases TO authenticated;