-- Add competitor_scores column to ux_reports table
ALTER TABLE ux_reports 
ADD COLUMN IF NOT EXISTS competitor_scores JSONB;

-- Add comment for documentation
COMMENT ON COLUMN ux_reports.competitor_scores IS 'Array of competitor comparison scores with category, score, and comparison data';
