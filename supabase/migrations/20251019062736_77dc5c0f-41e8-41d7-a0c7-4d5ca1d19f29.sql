-- Add serial_number and model_number fields to materials table
ALTER TABLE public.materials 
ADD COLUMN serial_number TEXT,
ADD COLUMN model_number TEXT;

-- Create index for faster search
CREATE INDEX idx_materials_serial_number ON public.materials(serial_number);
CREATE INDEX idx_materials_model_number ON public.materials(model_number);
CREATE INDEX idx_materials_title ON public.materials USING gin(to_tsvector('english', title));
CREATE INDEX idx_materials_product_name ON public.materials USING gin(to_tsvector('english', product_name));