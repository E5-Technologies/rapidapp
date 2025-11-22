-- Create locations table to store well/location data
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tank', 'fed', 'other')),
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  operator TEXT,
  field TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Users can view their own locations"
ON public.locations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations"
ON public.locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
ON public.locations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
ON public.locations
FOR DELETE
USING (auth.uid() = user_id);

-- Create favorite_locations table
CREATE TABLE public.favorite_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for favorite_locations
CREATE POLICY "Users can view their own favorite locations"
ON public.favorite_locations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite locations"
ON public.favorite_locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite locations"
ON public.favorite_locations
FOR DELETE
USING (auth.uid() = user_id);