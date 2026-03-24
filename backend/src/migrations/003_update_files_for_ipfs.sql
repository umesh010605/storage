-- Migration: Update files table for IPFS integration
-- This migration adds IPFS support while keeping existing encryption working

-- Add storage_location column
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS storage_location VARCHAR(20) DEFAULT 'local' 
CHECK (storage_location IN ('ipfs', 'local'));

-- Update existing records to set storage_location based on ipfs_hash
UPDATE files 
SET storage_location = CASE 
  WHEN ipfs_hash IS NOT NULL AND ipfs_hash != '' THEN 'ipfs'
  ELSE 'local'
END
WHERE storage_location IS NULL OR storage_location = 'local';

-- Create index on storage_location for better query performance
CREATE INDEX IF NOT EXISTS idx_files_storage_location ON files(storage_location);

-- Add comment to document the schema
COMMENT ON COLUMN files.storage_location IS 'Indicates where the file is primarily stored: ipfs or local';
COMMENT ON COLUMN files.encryption_key IS 'Encryption key for AES-256 encryption';
COMMENT ON COLUMN files.ipfs_hash IS 'IPFS content identifier (CID) for files stored on IPFS';
