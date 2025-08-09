-- Add notes and is_favorite columns to NutritionEntry table
ALTER TABLE "NutritionEntry" 
ADD COLUMN notes text,
ADD COLUMN is_favorite boolean DEFAULT false;