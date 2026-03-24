import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle, handleUploadError } from '../middleware/upload';

const router = Router();
const fileController = new FileController();

// All file routes require authentication
router.use(authenticateToken);

// File operations
router.post('/upload', uploadSingle, handleUploadError, fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/stats', fileController.getUserStats);
router.get('/:id', fileController.getFileInfo);
router.get('/:id/download', fileController.downloadFile);
router.get('/:id/download-encrypted', fileController.downloadEncryptedFile);
router.get('/:id/verify', fileController.verifyFile);
router.get('/:id/history', fileController.getFileHistory);
router.delete('/:id', fileController.deleteFile);

export default router;