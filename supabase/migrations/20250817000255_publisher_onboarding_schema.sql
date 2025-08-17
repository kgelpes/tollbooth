-- Tollbooth Publisher Database Schema Migration
-- This migration adds tables for publisher onboarding functionality

-- Publishers table - stores main site and payment information
CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- From better-auth (SIWE address or user ID)
    
    -- Step 1: Site Information  
    site_name TEXT NOT NULL,
    site_url TEXT NOT NULL,
    
    -- Step 2: Payment Configuration
    base_fee_usdc DECIMAL(10, 6) NOT NULL DEFAULT 0.01,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT publishers_site_url_check CHECK (site_url ~* '^https?://'),
    CONSTRAINT publishers_base_fee_positive CHECK (base_fee_usdc > 0)
);

-- Revenue splits table - stores multiple wallet addresses and percentages per publisher
CREATE TABLE IF NOT EXISTS revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    
    -- Step 3: Revenue Splits
    wallet_address TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT revenue_splits_wallet_format CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$'),
    CONSTRAINT revenue_splits_percentage_range CHECK (percentage >= 0 AND percentage <= 100)
);

-- Publisher API keys table - stores generated API keys for integration
CREATE TABLE IF NOT EXISTS publisher_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    
    -- Step 4: Integration Setup
    api_key TEXT NOT NULL UNIQUE,
    key_name TEXT DEFAULT 'Default',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Security & tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT publisher_api_keys_key_format CHECK (api_key ~* '^tollbooth_[a-zA-Z0-9_-]{32}$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_publishers_user_id ON publishers(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_publisher_id ON revenue_splits(publisher_id);
CREATE INDEX IF NOT EXISTS idx_publisher_api_keys_publisher_id ON publisher_api_keys(publisher_id);
CREATE INDEX IF NOT EXISTS idx_publisher_api_keys_api_key ON publisher_api_keys(api_key);

-- RLS (Row Level Security) Policies
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE publisher_api_keys ENABLE ROW LEVEL SECURITY;

-- Publishers can only see their own data
CREATE POLICY "Users can view own publishers" ON publishers FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own publishers" ON publishers FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own publishers" ON publishers FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own publishers" ON publishers FOR DELETE USING (user_id = auth.uid()::text);

-- Revenue splits policies
CREATE POLICY "Users can view own revenue splits" ON revenue_splits FOR SELECT USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can insert own revenue splits" ON revenue_splits FOR INSERT WITH CHECK (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can update own revenue splits" ON revenue_splits FOR UPDATE USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can delete own revenue splits" ON revenue_splits FOR DELETE USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);

-- API keys policies  
CREATE POLICY "Users can view own api keys" ON publisher_api_keys FOR SELECT USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can insert own api keys" ON publisher_api_keys FOR INSERT WITH CHECK (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can update own api keys" ON publisher_api_keys FOR UPDATE USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can delete own api keys" ON publisher_api_keys FOR DELETE USING (
    publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()::text)
);

-- Function to validate revenue splits don't exceed 100%
CREATE OR REPLACE FUNCTION validate_revenue_splits_total()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT SUM(percentage) FROM revenue_splits WHERE publisher_id = COALESCE(NEW.publisher_id, OLD.publisher_id)) > 100 THEN
        RAISE EXCEPTION 'Total revenue splits percentage cannot exceed 100%%';
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate revenue splits
CREATE TRIGGER validate_revenue_splits_trigger
    AFTER INSERT OR UPDATE OR DELETE ON revenue_splits
    FOR EACH ROW EXECUTE FUNCTION validate_revenue_splits_total();

-- Function to generate API keys
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
    RETURN 'tollbooth_' || encode(gen_random_bytes(24), 'base64')::text;
END;
$$ LANGUAGE plpgsql;
