-- Modify AIMessageLog table to store chat conversations properly
ALTER TABLE public.AIMessageLog 
DROP COLUMN IF EXISTS content,
DROP COLUMN IF EXISTS messagetype;

ALTER TABLE public.AIMessageLog 
ADD COLUMN userinput TEXT NOT NULL DEFAULT '',
ADD COLUMN airesponse TEXT NOT NULL DEFAULT '';

-- Update the table comment to reflect its new purpose
COMMENT ON TABLE public.AIMessageLog IS 'Stores chat conversation history between users and the AI fitness coach';