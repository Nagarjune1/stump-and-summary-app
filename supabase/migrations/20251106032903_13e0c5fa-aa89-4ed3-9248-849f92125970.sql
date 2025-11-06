-- Fix match_permissions table security issues
-- Make critical columns NOT NULL and add foreign key constraints

-- First, update any existing NULL values (if any)
UPDATE match_permissions 
SET user_id = created_by 
FROM matches 
WHERE match_permissions.match_id = matches.id 
  AND match_permissions.user_id IS NULL 
  AND matches.created_by IS NOT NULL;

-- Delete any orphaned records that can't be fixed
DELETE FROM match_permissions 
WHERE user_id IS NULL OR match_id IS NULL;

-- Now make columns NOT NULL
ALTER TABLE match_permissions 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN match_id SET NOT NULL;

-- Add foreign key constraints for referential integrity
ALTER TABLE match_permissions
  ADD CONSTRAINT fk_match_permissions_match 
  FOREIGN KEY (match_id) 
  REFERENCES matches(id) 
  ON DELETE CASCADE;

-- Note: We don't add a foreign key to auth.users as it's managed by Supabase
-- Instead, we rely on the profiles table which mirrors auth.users

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_match_permissions_user_id ON match_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_permissions_match_id ON match_permissions(match_id);