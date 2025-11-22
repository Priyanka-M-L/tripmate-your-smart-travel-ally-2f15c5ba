-- Add carbon footprint and transport columns to itinerary_items table
ALTER TABLE public.itinerary_items 
ADD COLUMN IF NOT EXISTS carbon_footprint DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transport_mode TEXT,
ADD COLUMN IF NOT EXISTS transport_distance DECIMAL(10,2);