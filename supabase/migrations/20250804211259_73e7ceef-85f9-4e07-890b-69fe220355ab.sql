-- Enable Row Level Security on all tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WorkoutEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NutritionEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Measurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AIMessageLog" ENABLE ROW LEVEL SECURITY;

-- Create profiles table for Supabase auth integration
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  age INTEGER,
  height DOUBLE PRECISION,
  weight DOUBLE PRECISION,
  fitness_goal TEXT,
  units_preference TEXT DEFAULT 'metric',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for WorkoutSession
CREATE POLICY "Users can view their own workout sessions" 
ON public."WorkoutSession" 
FOR SELECT 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can insert their own workout sessions" 
ON public."WorkoutSession" 
FOR INSERT 
WITH CHECK (userid = auth.uid()::text);

CREATE POLICY "Users can update their own workout sessions" 
ON public."WorkoutSession" 
FOR UPDATE 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can delete their own workout sessions" 
ON public."WorkoutSession" 
FOR DELETE 
USING (userid = auth.uid()::text);

-- Create RLS policies for WorkoutEntry
CREATE POLICY "Users can view their own workout entries" 
ON public."WorkoutEntry" 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public."WorkoutSession" 
  WHERE id = workoutsessionid AND userid = auth.uid()::text
));

CREATE POLICY "Users can insert their own workout entries" 
ON public."WorkoutEntry" 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public."WorkoutSession" 
  WHERE id = workoutsessionid AND userid = auth.uid()::text
));

CREATE POLICY "Users can update their own workout entries" 
ON public."WorkoutEntry" 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public."WorkoutSession" 
  WHERE id = workoutsessionid AND userid = auth.uid()::text
));

CREATE POLICY "Users can delete their own workout entries" 
ON public."WorkoutEntry" 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public."WorkoutSession" 
  WHERE id = workoutsessionid AND userid = auth.uid()::text
));

-- Create RLS policies for NutritionEntry
CREATE POLICY "Users can view their own nutrition entries" 
ON public."NutritionEntry" 
FOR SELECT 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can insert their own nutrition entries" 
ON public."NutritionEntry" 
FOR INSERT 
WITH CHECK (userid = auth.uid()::text);

CREATE POLICY "Users can update their own nutrition entries" 
ON public."NutritionEntry" 
FOR UPDATE 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can delete their own nutrition entries" 
ON public."NutritionEntry" 
FOR DELETE 
USING (userid = auth.uid()::text);

-- Create RLS policies for Measurement
CREATE POLICY "Users can view their own measurements" 
ON public."Measurement" 
FOR SELECT 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can insert their own measurements" 
ON public."Measurement" 
FOR INSERT 
WITH CHECK (userid = auth.uid()::text);

CREATE POLICY "Users can update their own measurements" 
ON public."Measurement" 
FOR UPDATE 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can delete their own measurements" 
ON public."Measurement" 
FOR DELETE 
USING (userid = auth.uid()::text);

-- Create RLS policies for AIMessageLog
CREATE POLICY "Users can view their own AI messages" 
ON public."AIMessageLog" 
FOR SELECT 
USING (userid = auth.uid()::text);

CREATE POLICY "Users can insert their own AI messages" 
ON public."AIMessageLog" 
FOR INSERT 
WITH CHECK (userid = auth.uid()::text);

-- Exercises table should be public (no RLS policies needed as it's shared data)
-- But let's add policies for custom exercises
CREATE POLICY "Everyone can view exercises" 
ON public."Exercise" 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can insert exercises" 
ON public."Exercise" 
FOR INSERT 
WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();