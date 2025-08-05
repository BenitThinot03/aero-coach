-- Enable Row Level Security on all tables that have policies but RLS disabled
-- This fixes the critical security issues detected by the linter

-- Enable RLS on all tables that have policies
ALTER TABLE "WorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NutritionEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Measurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIMessageLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;