import { Response } from 'express';
import { FileService } from '../services/FileService';
import { AuthenticatedRequest } from '../middleware/auth';

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  uploadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: {
            message: 'No file provided'
          }
        });
        return;
      }

      const userId = req.user!.id;
      const password = req.body.password; // Optional password from request
      const uploadedFile = await this.fileService.uploadFile(req.file, userId, password);

      res.status(201).json({
        message: 'File uploaded successfully',
        data: {
          file: uploadedFile
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : 'File upload failed'
        }
      });
    }
  };

  getFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const files = await this.fileService.getUserFiles(userId);

      res.json({
        data: {
          files
        }
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to retrieve files'
        }
      });
    }
  };

  downloadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const password = req.query.password as string | undefined; // Password from query parameter

      const fileData = await this.fileService.downloadFile(id, userId, password);

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
      res.setHeader('Content-Type', fileData.mimetype);
      res.setHeader('Content-Length', fileData.buffer.length);

      res.send(fileData.buffer);
    } catch (error) {
      console.error('File download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'File download failed';
      
      // Check if it's a password error - use 400 instead of 401 to avoid logout
      if (errorMessage.includes('Invalid password')) {
        res.status(400).json({
          error: {
            message: 'Invalid password for file decryption',
            code: 'INVALID_PASSWORD'
          }
        });
      } else {
        res.status(404).json({
          error: {
            message: errorMessage
          }
        });
      }
    }
  };

  downloadEncryptedFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const fileData = await this.fileService.downloadEncryptedFile(id, userId);

      // Set headers for encrypted file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
      res.setHeader('Content-Type', fileData.mimetype);
      res.setHeader('Content-Length', fileData.buffer.length);

      res.send(fileData.buffer);
    } catch (error) {
      console.error('Encrypted file download error:', error);
      res.status(404).json({
        error: {
          message: error instanceof Error ? error.message : 'File download failed'
        }
      });
    }
  };

  deleteFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.fileService.deleteFile(id, userId);

      res.json({
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(404).json({
        error: {
          message: error instanceof Error ? error.message : 'File deletion failed'
        }
      });
    }
  };

  getFileInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await this.fileService.getFileById(id, userId);
      if (!file) {
        res.status(404).json({
          error: {
            message: 'File not found'
          }
        });
        return;
      }

      res.json({
        data: {
          file: {
            id: file.id,
            original_name: file.original_name,
            file_size: file.file_size,
            mime_type: file.mime_type,
            upload_date: file.upload_date,
            ipfs_hash: file.ipfs_hash,
            blockchain_tx_hash: file.blockchain_tx_hash
          }
        }
      });
    } catch (error) {
      console.error('Get file info error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to retrieve file information'
        }
      });
    }
  };

  getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const stats = await this.fileService.getUserStats(userId);

      res.json({
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to retrieve user statistics'
        }
      });
    }
  };

  verifyFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const fileId = req.params.id;

      const verification = await this.fileService.verifyFileIntegrity(fileId, userId);

      res.json({
        message: verification.message,
        data: {
          valid: verification.valid,
          blockchainRecords: verification.blockchainRecords
        }
      });
    } catch (error) {
      console.error('File verification error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : 'File verification failed'
        }
      });
    }
  };

  getFileHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const fileId = req.params.id;

      const history = await this.fileService.getFileHistory(fileId, userId);

      res.json({
        data: {
          history,
          count: history.length
        }
      });
    } catch (error) {
      console.error('Get file history error:', error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : 'Failed to get file history'
        }
      });
    }
  };
}
