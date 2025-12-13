-- Add phone number field to profiles table for WhatsApp integration
ALTER TABLE public.profiles
ADD COLUMN phone text;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.phone IS 'WhatsApp-ready phone number in international format (e.g., +254712345678)';