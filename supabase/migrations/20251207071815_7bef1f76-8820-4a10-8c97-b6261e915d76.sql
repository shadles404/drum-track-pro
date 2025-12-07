-- Add pricing columns to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS unit_price numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) NOT NULL DEFAULT 0;