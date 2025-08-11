-- Add chat window columns to AIMessageLog table
ALTER TABLE public.AIMessageLog 
ADD COLUMN chat_window_id TEXT DEFAULT gen_random_uuid(),
ADD COLUMN chat_window_name TEXT DEFAULT 'New chat';

-- Update existing records to have a default chat window
UPDATE public.AIMessageLog 
SET chat_window_id = gen_random_uuid()
WHERE chat_window_id IS NULL;

-- Create index for better performance when querying by chat window
CREATE INDEX idx_aimessagelog_chat_window_id ON public.AIMessageLog(chat_window_id);
CREATE INDEX idx_aimessagelog_userid_chat_window_id ON public.AIMessageLog(userid, chat_window_id);