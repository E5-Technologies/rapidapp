-- Create equipment_suppliers table for the equipment finder feature
CREATE TABLE public.equipment_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  catalog_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.equipment_suppliers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (equipment catalog should be viewable by everyone)
CREATE POLICY "Equipment suppliers are viewable by everyone" 
ON public.equipment_suppliers 
FOR SELECT 
USING (true);

-- Only admins can manage equipment suppliers
CREATE POLICY "Admins can insert equipment suppliers" 
ON public.equipment_suppliers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update equipment suppliers" 
ON public.equipment_suppliers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete equipment suppliers" 
ON public.equipment_suppliers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for category filtering
CREATE INDEX idx_equipment_suppliers_category ON public.equipment_suppliers(category);