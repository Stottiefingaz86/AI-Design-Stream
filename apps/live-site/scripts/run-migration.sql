-- Copy this SQL and run it in Supabase SQL Editor
-- Or use the Supabase CLI: supabase db push

-- Knowledge Base Schema for AI Agency
-- Stores UX reports, Figma assets, design tokens, and all knowledge for CH (Head of UX/CX and Design)

-- UX Reports Table
CREATE TABLE IF NOT EXISTS ux_reports (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'Jurnii', 'Website Analysis', 'Google Web Search', 'Manual'
  source_url TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  overall_rating NUMERIC,
  total_reviews INTEGER,
  themes JSONB, -- Array of theme strings
  findings JSONB NOT NULL, -- Array of finding objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Figma Assets Table
CREATE TABLE IF NOT EXISTS figma_assets (
  id TEXT PRIMARY KEY,
  figma_file_id TEXT NOT NULL,
  figma_file_name TEXT,
  figma_file_url TEXT,
  asset_type TEXT NOT NULL, -- 'component', 'color', 'typography', 'logo', 'spacing', 'shadow', 'border-radius'
  asset_name TEXT NOT NULL,
  asset_data JSONB NOT NULL, -- Full asset data (varies by type)
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design Tokens Table
CREATE TABLE IF NOT EXISTS design_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  token_type TEXT NOT NULL, -- 'color', 'typography', 'spacing', 'shadow', 'border-radius'
  token_name TEXT NOT NULL UNIQUE,
  token_value TEXT NOT NULL,
  description TEXT,
  figma_link TEXT,
  brand TEXT, -- 'BetOnline', 'Wild Casino', etc. or 'common'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholders Table
CREATE TABLE IF NOT EXISTS stakeholders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  responsibilities JSONB, -- Array of strings
  contact TEXT,
  areas JSONB, -- Array of areas they work on
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processes Table
CREATE TABLE IF NOT EXISTS processes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB, -- Array of step strings
  stakeholders JSONB, -- Array of stakeholder names
  areas JSONB, -- Array of areas this applies to
  tools JSONB, -- Array of tools used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Notes Table
CREATE TABLE IF NOT EXISTS knowledge_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'design-system', 'brand-guidelines', 'insights', 'research'
  tags JSONB, -- Array of tag strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ux_reports_source ON ux_reports(source);
CREATE INDEX IF NOT EXISTS idx_ux_reports_date ON ux_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_figma_assets_type ON figma_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_figma_assets_file_id ON figma_assets(figma_file_id);
CREATE INDEX IF NOT EXISTS idx_design_tokens_type ON design_tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_design_tokens_brand ON design_tokens(brand);
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_category ON knowledge_notes(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_ux_reports_updated_at BEFORE UPDATE ON ux_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_figma_assets_updated_at BEFORE UPDATE ON figma_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_tokens_updated_at BEFORE UPDATE ON design_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at BEFORE UPDATE ON processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_notes_updated_at BEFORE UPDATE ON knowledge_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Allow all operations for now
ALTER TABLE ux_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_notes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on ux_reports" ON ux_reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on figma_assets" ON figma_assets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on design_tokens" ON design_tokens
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on stakeholders" ON stakeholders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on processes" ON processes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on knowledge_notes" ON knowledge_notes
  FOR ALL USING (true) WITH CHECK (true);
