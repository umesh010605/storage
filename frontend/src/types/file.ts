export interface FileItem {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  ipfs_hash?: string;
  blockchain_tx_hash?: string;
}

export interface FileStats {
  fileCount: number;
  totalSize: number;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'encrypting' | 'complete' | 'error';
  error?: string;
}