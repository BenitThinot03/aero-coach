import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, userId, chatWindowId, chatWindowName, imageData } = await req.json();

    if ((!userInput && !imageData) || !userId || !chatWindowId) {
      return new Response(
        JSON.stringify({ error: 'User input or image, user ID, and chat window ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing chat request for user:', userId);
    console.log('User input:', userInput);

    // Fetch all conversation history for this chat window
    const { data: conversationHistory, error: historyError } = await supabase
      .from('AIMessageLog')
      .select('userinput, airesponse, timestamp')
      .eq('userid', userId)
      .eq('chat_window_id', chatWindowId)
      .order('timestamp', { ascending: true }); // Get all messages in chronological order

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Format conversation history into the required structure
    const conversationInput = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Add all conversation history in chronological order
      for (const message of conversationHistory) {
        // Add user input
        conversationInput.push({
          role: "user",
          content: [
            {
              type: "input_text",
              text: message.userinput || ""
            }
          ]
        });
        
        // Add AI response
        conversationInput.push({
          role: "assistant", 
          content: [
            {
              type: "output_text",
              text: message.airesponse || ""
            }
          ]
        });
      }
    }

    // Add the new user input
    const newUserContent = [];
    if (userInput) {
      newUserContent.push({
        type: "input_text",
        text: userInput
      });
    }
    if (imageData) {
      newUserContent.push({
        type: "input_image",
        image_url: imageData
      });
    }

    conversationInput.push({
      role: "user",
      content: newUserContent
    });

    console.log('Conversation input length:', conversationInput.length);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: conversationInput,
        max_output_tokens: 1000,
        temperature: 0.7,
        instructions: "You are a friendly and professional fitness and nutrition coach for someone who does weight training, sports, and pays attention to their diet. Give clear, practical, and encouraging advice on workouts, nutrition, and healthy habits."
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.output[0].content[0].text;

    console.log('AI response:', aiResponse);

    // Store the conversation in the database (don't store image data)
    const { error: dbError } = await supabase
      .from('AIMessageLog')
      .insert({
        userid: userId,
        userinput: userInput || 'Image uploaded',
        airesponse: aiResponse,
        timestamp: new Date().toISOString(),
        chat_window_id: chatWindowId,
        chat_window_name: chatWindowName || 'New chat'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fitness-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});