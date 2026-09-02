-- Add permissions column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions text DEFAULT '["all_access"]';

-- Set all_access for existing admin users
UPDATE users SET permissions = '["all_access"]' WHERE role = 'admin' AND (permissions IS NULL OR permissions = '');
