-- Add userid column to Exercise table to support custom exercises
ALTER TABLE public."Exercise" ADD COLUMN userid text;

-- Add notes column for additional exercise information
ALTER TABLE public."Exercise" ADD COLUMN notes text;

-- Add created_at timestamp for custom exercises
ALTER TABLE public."Exercise" ADD COLUMN created_at timestamp without time zone DEFAULT now();

-- Update RLS policies to allow users to see global exercises (userid IS NULL) and their own custom exercises
DROP POLICY IF EXISTS "Everyone can view exercises" ON public."Exercise";
DROP POLICY IF EXISTS "Everyone can insert exercises" ON public."Exercise";

-- New policy: Users can view global exercises and their own custom exercises
CREATE POLICY "Users can view global and own exercises" ON public."Exercise"
FOR SELECT USING (userid IS NULL OR userid = (auth.uid())::text);

-- New policy: Users can insert their own custom exercises
CREATE POLICY "Users can insert custom exercises" ON public."Exercise"
FOR INSERT WITH CHECK (userid = (auth.uid())::text);

-- New policy: Users can update their own custom exercises
CREATE POLICY "Users can update own exercises" ON public."Exercise"
FOR UPDATE USING (userid = (auth.uid())::text);

-- New policy: Users can delete their own custom exercises
CREATE POLICY "Users can delete own exercises" ON public."Exercise"
FOR DELETE USING (userid = (auth.uid())::text);