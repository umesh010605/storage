import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/BlockchainService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Get blockchain statistics
 * GET /api/blockchain/stats
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = blockchainService.getStats();
    
    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get entire blockchain
 * GET /api/blockchain/chain
 */
router.get('/chain', authenticateToken, async (req: Request, res: Response) => {
  try {
    const chain = blockchainService.getChain();
    
    return res.json({
      success: true,
      chain,
      length: chain.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get user's blockchain transactions
 * GET /api/blockchain/user
 */
router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const blocks = blockchainService.getUserBlocks(userId);
    
    return res.json({
      success: true,
      blocks,
      count: blocks.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify blockchain integrity
 * GET /api/blockchain/verify
 */
router.get('/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const isValid = blockchainService.isChainValid();
    
    return res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Blockchain is valid' : 'Blockchain has been tampered with'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Export blockchain
 * GET /api/blockchain/export
 */
router.get('/export', authenticateToken, async (req: Request, res: Response) => {
  try {
    const chainData = blockchainService.exportChain();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=blockchain.json');
    
    return res.send(chainData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
