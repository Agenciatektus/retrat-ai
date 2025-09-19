-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- EP-009: Security Hardening & Compliance
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin users can see all profiles
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create projects for themselves
CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Admin users can see all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- ASSETS TABLE POLICIES
-- =====================================================

-- Users can only see assets from their own projects
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = assets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create assets in their own projects
CREATE POLICY "Users can create assets in own projects" ON assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = assets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update assets in their own projects
CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = assets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete assets from their own projects
CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = assets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- GENERATIONS TABLE POLICIES
-- =====================================================

-- Users can only see generations from their own projects
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = generations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create generations in their own projects
CREATE POLICY "Users can create generations in own projects" ON generations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = generations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update their own generations
CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = generations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert subscriptions (for Stripe webhooks)
CREATE POLICY "System can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Admin users can see all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- ADDON_PURCHASES TABLE POLICIES
-- =====================================================

-- Users can only see their own addon purchases
CREATE POLICY "Users can view own addon purchases" ON addon_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert addon purchases (for Stripe webhooks)
CREATE POLICY "System can insert addon purchases" ON addon_purchases
  FOR INSERT WITH CHECK (true);

-- Admin users can see all addon purchases
CREATE POLICY "Admins can view all addon purchases" ON addon_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- USAGE TABLE POLICIES
-- =====================================================

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage" ON usage
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert usage records
CREATE POLICY "System can insert usage" ON usage
  FOR INSERT WITH CHECK (true);

-- Admin users can see all usage
CREATE POLICY "Admins can view all usage" ON usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's project IDs (for performance)
CREATE OR REPLACE FUNCTION auth.user_project_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT id FROM projects 
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (auth.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- SECURITY VIEWS
-- =====================================================

-- View for user's own data (performance optimization)
CREATE OR REPLACE VIEW user_projects_view AS
SELECT p.* FROM projects p
WHERE p.user_id = auth.uid();

-- View for user's own assets
CREATE OR REPLACE VIEW user_assets_view AS
SELECT a.* FROM assets a
JOIN projects p ON a.project_id = p.id
WHERE p.user_id = auth.uid();

-- Grant access to views
GRANT SELECT ON user_projects_view TO authenticated;
GRANT SELECT ON user_assets_view TO authenticated;

