export interface FileRecord {
  id: string;
  user_id: string;
  original_name: string;
  encrypted_name: string;
  file_size: number;
  mime_type: string;
  encryption_key: string;
  encryption_iv: string;
  upload_date: Date;
  ipfs_hash?: string | null;
  storage_location?: 'ipfs' | 'local';
  blockchain_tx_hash?: string;
  status: 'active' | 'deleted';
}

export interface CreateFileData {
  user_id: string;
  original_name: string;
  encrypted_name: string;
  file_size: number;
  mime_type: string;
  encryption_key: string;
  encryption_iv: string;
  ipfs_hash?: string | null;
  storage_location?: 'ipfs' | 'local';
}

export interface FileResponse {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  upload_date: Date;
  ipfs_hash?: string | null;
  storage_location?: 'ipfs' | 'local';
  blockchain_tx_hash?: string;
}