-- Pricing v1.2 Migration
-- Adds support for new engines and usage tracking

-- Add premium_included column to subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS premium_included INT DEFAULT 0;

-- Add new usage tracking columns
ALTER TABLE usage 
ADD COLUMN IF NOT EXISTS std_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS premium_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fast_paid INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS upscale_paid INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS edit_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS kontext_used INT DEFAULT 0;

-- Create addon_purchases table for tracking paid add-ons
CREATE TABLE IF NOT EXISTS addon_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_type VARCHAR(20) NOT NULL CHECK (addon_type IN ('fast', 'premium', 'upscale')),
  price_brl DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for addon_purchases
CREATE INDEX IF NOT EXISTS idx_addon_purchases_user_id ON addon_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_type ON addon_purchases(addon_type);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_status ON addon_purchases(status);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_created_at ON addon_purchases(created_at DESC);

-- RLS for addon_purchases
ALTER TABLE addon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addon purchases"
  ON addon_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addon purchases"
  ON addon_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create generations_v2 table for new engine tracking
CREATE TABLE IF NOT EXISTS generations_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine VARCHAR(20) NOT NULL CHECK (engine IN ('standard', 'fast', 'premium', 'edit', 'kontext', 'upscale')),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('replicate', 'kie')),
  model VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  prompt TEXT,
  input_image_url TEXT,
  output_image_url TEXT,
  cost_usd DECIMAL(10,6) NOT NULL,
  cost_brl DECIMAL(10,2) NOT NULL,
  processing_time_ms INT,
  provider_id VARCHAR(255), -- Replicate/KIE ID
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for generations_v2
CREATE INDEX IF NOT EXISTS idx_generations_v2_project_id ON generations_v2(project_id);
CREATE INDEX IF NOT EXISTS idx_generations_v2_user_id ON generations_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_v2_engine ON generations_v2(engine);
CREATE INDEX IF NOT EXISTS idx_generations_v2_status ON generations_v2(status);
CREATE INDEX IF NOT EXISTS idx_generations_v2_created_at ON generations_v2(created_at DESC);

-- RLS for generations_v2
ALTER TABLE generations_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations"
  ON generations_v2 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
  ON generations_v2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON generations_v2 FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER addon_purchases_updated_at
  BEFORE UPDATE ON addon_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generations_v2_updated_at
  BEFORE UPDATE ON generations_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to debit standard credits
CREATE OR REPLACE FUNCTION debit_standard_credits(user_uuid UUID, amount INT DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_month TEXT;
  current_usage INT;
  quota_limit INT;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  
  -- Get or create usage record
  INSERT INTO usage (user_id, month, std_used)
  VALUES (user_uuid, current_month, 0)
  ON CONFLICT (user_id, month) DO NOTHING;
  
  -- Get current usage and quota
  SELECT std_used, quota_limit 
  INTO current_usage, quota_limit
  FROM usage 
  WHERE user_id = user_uuid AND month = current_month;
  
  -- Check if user has enough credits
  IF quota_limit IS NOT NULL AND current_usage + amount > quota_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Debit credits
  UPDATE usage 
  SET std_used = std_used + amount,
      updated_at = NOW()
  WHERE user_id = user_uuid AND month = current_month;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to debit premium credits
CREATE OR REPLACE FUNCTION debit_premium_credits(user_uuid UUID, amount INT DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_month TEXT;
  current_usage INT;
  premium_included INT;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  
  -- Get or create usage record
  INSERT INTO usage (user_id, month, premium_used)
  VALUES (user_uuid, current_month, 0)
  ON CONFLICT (user_id, month) DO NOTHING;
  
  -- Get current premium usage and included quota
  SELECT u.premium_used, COALESCE(s.premium_included, 0)
  INTO current_usage, premium_included
  FROM usage u
  LEFT JOIN subscriptions s ON s.user_id = u.user_id AND s.status = 'active'
  WHERE u.user_id = user_uuid AND u.month = current_month;
  
  -- Check if user has enough premium credits
  IF current_usage + amount > premium_included THEN
    RETURN FALSE;
  END IF;
  
  -- Debit premium credits
  UPDATE usage 
  SET premium_used = premium_used + amount,
      updated_at = NOW()
  WHERE user_id = user_uuid AND month = current_month;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
