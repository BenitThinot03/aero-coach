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
    const { userInput, userId } = await req.json();

    if (!userInput || !userId) {
      return new Response(
        JSON.stringify({ error: 'User input and user ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing chat request for user:', userId);
    console.log('User input:', userInput);

    // Fetch the last 10 conversation pairs for context
    const { data: conversationHistory, error: historyError } = await supabase
      .from('AIMessageLog')
      .select('userinput, airesponse, timestamp')
      .eq('userid', userId)
      .order('timestamp', { ascending: false })
      .limit(20); // Get 20 to ensure we have 10 pairs (user + AI responses)

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Format conversation history into the required structure
    const conversationInput = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Reverse to get chronological order and take last 10 pairs
      const recentHistory = conversationHistory.reverse().slice(-20);
      
      for (let i = 0; i < recentHistory.length; i += 2) {
        const userMessage = recentHistory[i];
        const aiMessage = recentHistory[i + 1];
        
        if (userMessage) {
          conversationInput.push({
            role: "user",
            content: [
              {
                type: "input_text",
                text: userMessage.userinput || ""
              }
            ]
          });
        }
        
        if (aiMessage) {
          conversationInput.push({
            role: "assistant", 
            content: [
              {
                type: "output_text",
                text: aiMessage.airesponse || ""
              }
            ]
          });
        }
      }
    }

    // Add the new user input
    conversationInput.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: userInput
        }
      ]
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

    // Store the conversation in the database
    const { error: dbError } = await supabase
      .from('AIMessageLog')
      .insert({
        userid: userId,
        userinput: userInput,
        airesponse: aiResponse,
        timestamp: new Date().toISOString()
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