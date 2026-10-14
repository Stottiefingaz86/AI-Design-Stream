-- Add Jurnii-specific sections to ux_reports table
ALTER TABLE ux_reports 
ADD COLUMN IF NOT EXISTS executive_summary TEXT,
ADD COLUMN IF NOT EXISTS perception JSONB,
ADD COLUMN IF NOT EXISTS journey JSONB,
ADD COLUMN IF NOT EXISTS trends JSONB,
ADD COLUMN IF NOT EXISTS performance JSONB,
ADD COLUMN IF NOT EXISTS checking JSONB;
