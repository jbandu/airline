-- Fix user preferences trigger to bypass RLS policies
-- This fixes the signup 500 error caused by RLS blocking the trigger

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS create_default_user_preferences() CASCADE;

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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_default_user_preferences ON auth.users;
CREATE TRIGGER trigger_create_default_user_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

COMMENT ON FUNCTION create_default_user_preferences() IS 'Automatically creates default preferences for new users. Uses SECURITY DEFINER to bypass RLS policies during trigger execution.';
