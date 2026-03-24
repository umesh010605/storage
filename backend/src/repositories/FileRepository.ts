import pool from '../config/database';
import { FileRecord, CreateFileData, FileResponse } from '../models/File';

export class FileRepository {
  async create(fileData: CreateFileData): Promise<FileResponse> {
    const query = `
      INSERT INTO files (
        user_id, original_name, encrypted_name, file_size, 
        mime_type, encryption_key, encryption_iv, auth_tag,
        ipfs_hash, storage_location
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, original_name, file_size, mime_type, upload_date, ipfs_hash, storage_location
    `;
    
    const { rows } = await pool.query(query, [
      fileData.user_id,
      fileData.original_name,
      fileData.encrypted_name,
      fileData.file_size,
      fileData.mime_type,
      fileData.encryption_key,
      fileData.encryption_iv,
      '', // Empty auth_tag since we're not using GCM anymore
      fileData.ipfs_hash || null,
      fileData.storage_location || 'local'
    ]);
    
    return rows[0];
  }

  async findById(id: string): Promise<FileRecord | null> {
    const query = 'SELECT * FROM files WHERE id = $1 AND status = $2';
    const { rows } = await pool.query(query, [id, 'active']);
    return rows[0] || null;
  }

  async findByUserId(userId: string): Promise<FileResponse[]> {
    const query = `
      SELECT id, original_name, file_size, mime_type, upload_date, 
             ipfs_hash, storage_location, blockchain_tx_hash
      FROM files 
      WHERE user_id = $1 AND status = $2
      ORDER BY upload_date DESC
    `;
    const { rows } = await pool.query(query, [userId, 'active']);
    return rows;
  }

  async findByUserIdAndFileId(userId: string, fileId: string): Promise<FileRecord | null> {
    const query = `
      SELECT * FROM files 
      WHERE id = $1 AND user_id = $2 AND status = $3
    `;
    const { rows } = await pool.query(query, [fileId, userId, 'active']);
    return rows[0] || null;
  }

  async updateIpfsHash(id: string, ipfsHash: string): Promise<void> {
    const query = 'UPDATE files SET ipfs_hash = $1 WHERE id = $2';
    await pool.query(query, [ipfsHash, id]);
  }

  async updateBlockchainTxHash(id: string, txHash: string): Promise<void> {
    const query = 'UPDATE files SET blockchain_tx_hash = $1 WHERE id = $2';
    await pool.query(query, [txHash, id]);
  }

  async softDelete(id: string): Promise<void> {
    const query = 'UPDATE files SET status = $1 WHERE id = $2';
    await pool.query(query, ['deleted', id]);
  }

  async hardDelete(id: string): Promise<void> {
    const query = 'DELETE FROM files WHERE id = $1';
    await pool.query(query, [id]);
  }

  async getUserFileCount(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM files WHERE user_id = $1 AND status = $2';
    const { rows } = await pool.query(query, [userId, 'active']);
    return parseInt(rows[0].count);
  }

  async getUserStorageUsed(userId: string): Promise<number> {
    const query = 'SELECT COALESCE(SUM(file_size), 0) as total FROM files WHERE user_id = $1 AND status = $2';
    const { rows } = await pool.query(query, [userId, 'active']);
    return parseInt(rows[0].total);
  }
}