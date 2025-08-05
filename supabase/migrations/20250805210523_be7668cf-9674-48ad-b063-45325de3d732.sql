-- Remove foreign key constraints that point to the unused User table
-- and clean up the database structure for proper Supabase auth integration

-- First, check and drop foreign key constraints pointing to User table
DO $$
BEGIN
    -- Drop foreign key constraint from WorkoutSession if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'WorkoutSession_userid_fkey' 
        AND table_name = 'WorkoutSession'
    ) THEN
        ALTER TABLE "WorkoutSession" DROP CONSTRAINT "WorkoutSession_userid_fkey";
    END IF;
    
    -- Drop foreign key constraint from NutritionEntry if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'NutritionEntry_userid_fkey' 
        AND table_name = 'NutritionEntry'
    ) THEN
        ALTER TABLE "NutritionEntry" DROP CONSTRAINT "NutritionEntry_userid_fkey";
    END IF;
    
    -- Drop foreign key constraint from Measurement if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Measurement_userid_fkey' 
        AND table_name = 'Measurement'
    ) THEN
        ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_userid_fkey";
    END IF;
    
    -- Drop foreign key constraint from AIMessageLog if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'AIMessageLog_userid_fkey' 
        AND table_name = 'AIMessageLog'
    ) THEN
        ALTER TABLE "AIMessageLog" DROP CONSTRAINT "AIMessageLog_userid_fkey";
    END IF;
END $$;

-- Now drop the unused User table since we're using Supabase auth with profiles table
DROP TABLE IF EXISTS "User";

-- Add proper indexes for performance on userid columns since they're used in RLS policies
CREATE INDEX IF NOT EXISTS idx_workoutsession_userid ON "WorkoutSession"(userid);
CREATE INDEX IF NOT EXISTS idx_nutritionentry_userid ON "NutritionEntry"(userid);
CREATE INDEX IF NOT EXISTS idx_measurement_userid ON "Measurement"(userid);
CREATE INDEX IF NOT EXISTS idx_aimessagelog_userid ON "AIMessageLog"(userid);

-- Add index on profiles user_id for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);