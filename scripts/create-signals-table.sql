-- Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  image VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type_index INTEGER NOT NULL, -- 0-5 for the 6 signal types
  order_index INTEGER NOT NULL, -- Order within the type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying by type
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type_index, order_index);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_signals_updated_at 
    BEFORE UPDATE ON signals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
