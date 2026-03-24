import { Router, Request, Response } from 'express';
import { pinataService } from '../services/PinataService';

const router = Router();

/**
 * Health check endpoint for IPFS connection (Pinata)
 * GET /api/health/ipfs
 */
router.get('/ipfs', async (req: Request, res: Response) => {
  try {
    const isAvailable = await pinataService.isAvailable();
    
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        ipfs: {
          available: false,
          status: 'disconnected',
          provider: 'Pinata',
          message: 'Pinata IPFS service is not available. Check your API credentials in .env file.'
        }
      });
    }

    const nodeInfo = await pinataService.getNodeInfo();
    
    return res.json({
      success: true,
      ipfs: {
        available: true,
        status: 'connected',
        ...nodeInfo
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      ipfs: {
        available: false,
        status: 'error',
        provider: 'Pinata',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * General health check
 * GET /api/health
 */
router.get('/', async (req: Request, res: Response) => {
  const ipfsAvailable = await pinataService.isAvailable();
  
  return res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      ipfs: ipfsAvailable ? 'connected' : 'disconnected',
      provider: 'Pinata'
    }
  });
});

export default router;
