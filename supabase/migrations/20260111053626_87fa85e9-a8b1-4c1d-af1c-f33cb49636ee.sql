-- Drop and recreate the category constraint to include all equipment supplier categories
ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS valid_category;

ALTER TABLE public.materials ADD CONSTRAINT valid_category 
CHECK (category = ANY (ARRAY['Valves'::text, 'Pumps'::text, 'Piping'::text, 'Instrumentation'::text, 'Electrical'::text, 'Vessels'::text, 'Tanks'::text, 'Automation'::text]));