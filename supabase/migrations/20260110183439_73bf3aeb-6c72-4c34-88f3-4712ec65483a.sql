-- Add sales contact info to equipment_suppliers table
ALTER TABLE public.equipment_suppliers 
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT,
ADD COLUMN contact_name TEXT,
ADD COLUMN description TEXT;