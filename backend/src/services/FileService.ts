import fs from 'fs/promises';
import path from 'path';
import { FileRepository } from '../repositories/FileRepository';
import { EncryptionService } from './EncryptionService';
import { pinataService } from './PinataService';
import { blockchainService } from './BlockchainService';
import { CreateFileData, FileResponse, FileRecord } from '../models/File';

export class FileService {
  private fileRepository: FileRepository;
  private encryptionService: EncryptionService;
  private uploadsDir: string;

  constructor() {
    this.fileRepository = new FileRepository();
    this.encryptionService = new EncryptionService();
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    password?: string
  ): Promise<FileResponse> {
    try {
      // Encrypt the file with password (uses default if not provided)
      const encryptionResult = this.encryptionService.encryptFileWithPassword(file.buffer, password);
      
      // Generate secure filename
      const encryptedFilename = this.encryptionService.generateSecureFilename(
        file.originalname,
        userId
      );

      // Create user directory if it doesn't exist
      const userDir = path.join(this.uploadsDir, 'encrypted', userId);
      await fs.mkdir(userDir, { recursive: true });

      // Save encrypted file to local disk (fallback storage)
      const filePath = path.join(userDir, encryptedFilename);
      await fs.writeFile(filePath, encryptionResult.encryptedData);

      // Try to upload to IPFS via Pinata
      let ipfsHash: string | null = null;
      let storageLocation: 'ipfs' | 'local' = 'local';

      if (await pinataService.isAvailable()) {
        try {
          console.log('Uploading encrypted file to IPFS via Pinata...');
          const ipfsResult = await pinataService.uploadFile(
            encryptionResult.encryptedData,
            encryptedFilename
          );
          ipfsHash = ipfsResult.hash;
          storageLocation = 'ipfs';
          console.log(`File uploaded to IPFS successfully: ${ipfsHash}`);
        } catch (ipfsError) {
          console.error('Pinata/IPFS upload failed, using local storage:', ipfsError);
          // Continue with local storage - file is already saved locally
        }
      } else {
        console.log('Pinata/IPFS is not available, using local storage');
      }

      // Store file metadata in database
      const fileData: CreateFileData = {
        user_id: userId,
        original_name: file.originalname,
        encrypted_name: encryptedFilename,
        file_size: file.size,
        mime_type: file.mimetype,
        encryption_key: encryptionResult.key,
        encryption_iv: encryptionResult.iv,
        ipfs_hash: ipfsHash,
        storage_location: storageLocation
      };

      const savedFile = await this.fileRepository.create(fileData);
      
      // Add transaction to blockchain
      const encryptionHash = this.encryptionService.generateKey(); // Generate hash for verification
      blockchainService.addTransaction({
        fileId: savedFile.id,
        userId: userId,
        fileName: file.originalname,
        ipfsHash: ipfsHash || 'local',
        fileSize: file.size,
        action: 'upload',
        encryptionHash: encryptionHash
      });
      
      return savedFile;
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileById(fileId: string, userId: string): Promise<FileRecord | null> {
    return this.fileRepository.findByUserIdAndFileId(userId, fileId);
  }

  async getUserFiles(userId: string): Promise<FileResponse[]> {
    return this.fileRepository.findByUserId(userId);
  }

  async downloadFile(fileId: string, userId: string, password?: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }> {
    try {
      // Get file metadata
      const fileRecord = await this.fileRepository.findByUserIdAndFileId(userId, fileId);
      if (!fileRecord) {
        throw new Error('File not found or access denied');
      }

      let encryptedData: Buffer;

      // Try to retrieve from IPFS first if available
      if (fileRecord.ipfs_hash && fileRecord.storage_location === 'ipfs' && await pinataService.isAvailable()) {
        try {
          console.log(`Retrieving file from IPFS: ${fileRecord.ipfs_hash}`);
          encryptedData = await pinataService.retrieveFile(fileRecord.ipfs_hash);
          console.log('File retrieved from IPFS successfully');
        } catch (ipfsError) {
          console.error('IPFS retrieval failed, falling back to local storage:', ipfsError);
          // Fallback to local storage
          encryptedData = await this.readLocalFile(userId, fileRecord.encrypted_name);
        }
      } else {
        // Retrieve from local storage
        console.log('Retrieving file from local storage');
        encryptedData = await this.readLocalFile(userId, fileRecord.encrypted_name);
      }

      // Decrypt the file with password
      const decryptedBuffer = this.encryptionService.decryptFileWithPassword(
        {
          encryptedData,
          key: fileRecord.encryption_key,
          iv: fileRecord.encryption_iv
        },
        password
      );

      // Add download transaction to blockchain
      blockchainService.addTransaction({
        fileId: fileId,
        userId: userId,
        fileName: fileRecord.original_name,
        ipfsHash: fileRecord.ipfs_hash || 'local',
        fileSize: fileRecord.file_size,
        action: 'download',
        encryptionHash: fileRecord.encryption_key
      });

      return {
        buffer: decryptedBuffer,
        filename: fileRecord.original_name,
        mimetype: fileRecord.mime_type || 'application/octet-stream'
      };
    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper method to read file from local storage
   */
  private async readLocalFile(userId: string, encryptedFilename: string): Promise<Buffer> {
    const filePath = path.join(
      this.uploadsDir,
      'encrypted',
      userId,
      encryptedFilename
    );
    return await fs.readFile(filePath);
  }

  async downloadEncryptedFile(fileId: string, userId: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }> {
    try {
      // Get file metadata
      const fileRecord = await this.fileRepository.findByUserIdAndFileId(userId, fileId);
      if (!fileRecord) {
        throw new Error('File not found or access denied');
      }

      let encryptedData: Buffer;

      // Try to retrieve from IPFS first if available
      if (fileRecord.ipfs_hash && fileRecord.storage_location === 'ipfs' && await pinataService.isAvailable()) {
        try {
          console.log(`Retrieving encrypted file from IPFS: ${fileRecord.ipfs_hash}`);
          encryptedData = await pinataService.retrieveFile(fileRecord.ipfs_hash);
        } catch (ipfsError) {
          console.error('IPFS retrieval failed, falling back to local storage:', ipfsError);
          encryptedData = await this.readLocalFile(userId, fileRecord.encrypted_name);
        }
      } else {
        encryptedData = await this.readLocalFile(userId, fileRecord.encrypted_name);
      }

      // Return the ENCRYPTED file (not decrypted) to show AES-256 encryption
      const encryptedFilename = fileRecord.original_name + '.encrypted';

      return {
        buffer: encryptedData,
        filename: encryptedFilename,
        mimetype: 'application/octet-stream' // Binary encrypted data
      };
    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // Get file metadata
      const fileRecord = await this.fileRepository.findByUserIdAndFileId(userId, fileId);
      if (!fileRecord) {
        throw new Error('File not found or access denied');
      }

      // Unpin from IPFS if stored there
      if (fileRecord.ipfs_hash && await pinataService.isAvailable()) {
        try {
          console.log(`Unpinning file from Pinata: ${fileRecord.ipfs_hash}`);
          await pinataService.unpinFile(fileRecord.ipfs_hash);
        } catch (ipfsError) {
          console.warn('Failed to unpin file from Pinata:', ipfsError);
          // Continue with deletion even if unpinning fails
        }
      }

      // Delete encrypted file from local disk
      const filePath = path.join(
        this.uploadsDir,
        'encrypted',
        userId,
        fileRecord.encrypted_name
      );

      try {
        await fs.unlink(filePath);
      } catch (fsError) {
        console.warn(`Could not delete file from disk: ${filePath}`, fsError);
        // Continue with database deletion even if file deletion fails
      }

      // Soft delete from database
      await this.fileRepository.softDelete(fileId);
      
      // Add delete transaction to blockchain
      blockchainService.addTransaction({
        fileId: fileId,
        userId: userId,
        fileName: fileRecord.original_name,
        ipfsHash: fileRecord.ipfs_hash || 'local',
        fileSize: fileRecord.file_size,
        action: 'delete',
        encryptionHash: fileRecord.encryption_key
      });
    } catch (error) {
      throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyFileIntegrity(fileId: string, userId: string): Promise<{
    valid: boolean;
    message: string;
    blockchainRecords: any[];
  }> {
    try {
      const fileRecord = await this.fileRepository.findByUserIdAndFileId(userId, fileId);
      if (!fileRecord) {
        throw new Error('File not found or access denied');
      }

      const verification = blockchainService.verifyFile(
        fileId,
        fileRecord.ipfs_hash || 'local'
      );

      return {
        valid: verification.valid,
        message: verification.message,
        blockchainRecords: verification.blocks
      };
    } catch (error) {
      throw new Error(`File verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileHistory(fileId: string, userId: string): Promise<any[]> {
    try {
      const fileRecord = await this.fileRepository.findByUserIdAndFileId(userId, fileId);
      if (!fileRecord) {
        throw new Error('File not found or access denied');
      }

      const blocks = blockchainService.getFileBlocks(fileId);
      return blocks.map(block => ({
        blockIndex: block.index,
        timestamp: new Date(block.timestamp).toISOString(),
        action: block.data.action,
        hash: block.hash,
        previousHash: block.previousHash
      }));
    } catch (error) {
      throw new Error(`Failed to get file history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserStats(userId: string): Promise<{
    fileCount: number;
    totalSize: number;
  }> {
    const fileCount = await this.fileRepository.getUserFileCount(userId);
    const totalSize = await this.fileRepository.getUserStorageUsed(userId);

    return {
      fileCount,
      totalSize
    };
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}