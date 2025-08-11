-- Add default UUID generation for the id column in AIMessageLog table
ALTER TABLE "AIMessageLog" ALTER COLUMN id SET DEFAULT gen_random_uuid();