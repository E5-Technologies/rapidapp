-- Create sales_contacts table for regional sales representatives
CREATE TABLE public.sales_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_contacts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view sales contacts
CREATE POLICY "Sales contacts are viewable by everyone"
ON public.sales_contacts
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_sales_contacts_manufacturer_region ON public.sales_contacts(manufacturer_id, region);

-- Insert sample sales contacts for major manufacturers
INSERT INTO public.sales_contacts (manufacturer_id, region, contact_name, phone, email)
SELECT 
  m.id,
  'Gulf Coast',
  'Sales Representative',
  '+1 (713) 555-0100',
  'sales.gulfcoast@' || lower(replace(m.name, ' ', '')) || '.com'
FROM public.manufacturers m
LIMIT 5;

INSERT INTO public.sales_contacts (manufacturer_id, region, contact_name, phone, email)
SELECT 
  m.id,
  'Texas',
  'Regional Manager',
  '+1 (214) 555-0200',
  'sales.texas@' || lower(replace(m.name, ' ', '')) || '.com'
FROM public.manufacturers m
LIMIT 5;