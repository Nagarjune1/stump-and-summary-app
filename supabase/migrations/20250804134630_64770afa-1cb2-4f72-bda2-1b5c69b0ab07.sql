
-- First, let's see what the current check constraint allows
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'matches'::regclass 
AND contype = 'c';

-- Drop the existing constraint if it exists
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;

-- Create a new constraint that includes all the status values being used in the application
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
CHECK (status IN ('upcoming', 'scheduled', 'in_progress', 'live', 'completed', 'cancelled'));
