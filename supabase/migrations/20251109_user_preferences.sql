-- User Preferences Table
-- Stores user UI preferences including theme selection

CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_theme TEXT NOT NULL DEFAULT 'palantir-dark' CHECK (ui_theme IN ('palantir-dark', 'classic-light')),
  sidebar_collapsed BOOLEAN DEFAULT false,
  default_view TEXT DEFAULT 'card',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  agent_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to automatically create preferences for new users
-- SECURITY DEFINER allows the function to bypass RLS policies
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_preferences (user_id, ui_theme)
  VALUES (NEW.id, 'palantir-dark')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when a new user signs up
DROP TRIGGER IF EXISTS trigger_create_default_user_preferences ON auth.users;
CREATE TRIGGER trigger_create_default_user_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert only their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete only their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_preferences IS 'Stores user UI preferences including theme selection, view modes, and notification settings';
COMMENT ON COLUMN user_preferences.ui_theme IS 'UI theme profile: palantir-dark (sophisticated dark) or classic-light (original style)';
COMMENT ON COLUMN user_preferences.sidebar_collapsed IS 'Whether the sidebar is collapsed by default';
COMMENT ON COLUMN user_preferences.default_view IS 'Default view mode for lists (card, table, grid)';
