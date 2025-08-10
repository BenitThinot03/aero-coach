import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image base64 data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing meal image with OpenAI...');

    const payload = {
      "model": "gpt-4o",
      "input": [
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": "Analyze the meal image and provide the nutritional information in the provided JSON structure output"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_image",
              "image_url": `data:image/jpeg;base64,${imageBase64}`,
              "detail": "high"
            }
          ]
        }
      ],
      "text": {
        "format": {
          "type": "json_schema",
          "name": "meal_nutrition_data",
          "strict": true,
          "schema": {
            "type": "object",
            "properties": {
              "fooditems": {
                "type": "array",
                "description": "List of food items detected in the image (e.g., chicken with vegetables, fries, dessert)",
                "items": {
                  "type": "string"
                }
              },
              "calories": {
                "type": "number",
                "description": "Total number of calories in the meal (in kcal)",
                "format": "float"
              },
              "protein": {
                "type": "number",
                "description": "Amount of protein in the meal (in grams)",
                "format": "float"
              },
              "carbs": {
                "type": "number",
                "description": "Amount of carbohydrates in the meal (in grams)",
                "format": "float"
              },
              "fats": {
                "type": "number",
                "description": "Amount of fats in the meal (in grams)",
                "format": "float"
              },
              "sugar": {
                "type": "number",
                "description": "Amount of sugar in the meal (in grams)",
                "format": "float"
              },
              "vitamins": {
                "type": "number",
                "description": "Amount of vitamins in the meal",
                "format": "float"
              }
            },
            "additionalProperties": false,
            "required": [
              "fooditems",
              "calories",
              "protein",
              "carbs",
              "fats",
              "sugar",
              "vitamins"
            ]
          }
        }
      },
      "temperature": 0.7,
      "instructions": "You are tasked with analyzing an image of a meal that will be provided to you. Your goal is to identify the different food items in the image and extract detailed nutritional information such as calories, protein, carbs, fats, sugar, and vitamins. The information must be extracted and returned in a structured JSON format. Please be accurate and make sure to provide the nutritional values for each food item detected."
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received');

    // Extract the structured output from the response
    const structuredOutput = data.output[0].content[0].text;
    const nutritionData = JSON.parse(structuredOutput);

    console.log('Nutrition data extracted:', nutritionData);

    return new Response(
      JSON.stringify({ success: true, nutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-meal-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});