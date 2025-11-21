-- Add NGO/organization verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS organization_type TEXT DEFAULT 'individual' CHECK (organization_type IN ('individual', 'ngo', 'community_partner', 'restaurant', 'grocery_store')),
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the organization/user is verified by admin';
COMMENT ON COLUMN public.profiles.organization_type IS 'Type of user: individual, ngo, community_partner, restaurant, grocery_store';
COMMENT ON COLUMN public.profiles.organization_name IS 'Official organization name (for NGOs and partners)';
COMMENT ON COLUMN public.profiles.verification_date IS 'Date when the organization was verified';