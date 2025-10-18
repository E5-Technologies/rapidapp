-- Create manufacturers table
CREATE TABLE public.manufacturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  product_name TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  image_url TEXT,
  datasheet_url TEXT,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('Valves', 'Pumps', 'Piping', 'Instrumentation', 'Electrical', 'Vessels'))
);

-- Create index for fast queries on category and purchase_count
CREATE INDEX idx_materials_category_purchases ON public.materials(category, purchase_count DESC);
CREATE INDEX idx_materials_manufacturer ON public.materials(manufacturer_id);

-- Enable Row Level Security
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Public read access for manufacturers
CREATE POLICY "Manufacturers are viewable by everyone" 
ON public.manufacturers 
FOR SELECT 
USING (true);

-- Public read access for materials
CREATE POLICY "Materials are viewable by everyone" 
ON public.materials 
FOR SELECT 
USING (true);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_materials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_materials_timestamp
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_materials_timestamp();