-- Insert default exercises into the Exercise table
INSERT INTO "Exercise" (id, name, type, category) VALUES
  (gen_random_uuid()::text, 'Push Ups', 'bodyweight', 'chest'),
  (gen_random_uuid()::text, 'Bench Press', 'weights', 'chest'),
  (gen_random_uuid()::text, 'Squats', 'bodyweight', 'legs'),
  (gen_random_uuid()::text, 'Deadlifts', 'weights', 'legs'),
  (gen_random_uuid()::text, 'Bicep Curls', 'weights', 'arms'),
  (gen_random_uuid()::text, 'Pull Ups', 'bodyweight', 'back'),
  (gen_random_uuid()::text, 'Lunges', 'bodyweight', 'legs'),
  (gen_random_uuid()::text, 'Plank', 'bodyweight', 'core');