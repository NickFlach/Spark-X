import express, { Request, Response } from 'express';
import { AnalyticsEngine } from '../../ai/analytics/AnalyticsEngine';
import { IdeaGovernance } from '../../ai/blockchain/IdeaGovernance';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const governance = new IdeaGovernance({
  votingThreshold: 100n,
  implementationReward: 1000n,
  validationReward: 500n,
  stakingRequirement: 1000n,
  cooldownPeriod: 86400, // 24 hours in seconds
});
const analytics = new AnalyticsEngine(governance);

/**
 * Get public analytics metrics
 * Rate limit: 100 requests per hour
 */
router.get(
  '/metrics',
  authenticateToken,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 100 }),
  async (req: Request, res: Response) => {
    try {
      const metrics = analytics.getMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics metrics',
      });
    }
  }
);

/**
 * Analyze department performance
 * Rate limit: 20 requests per hour
 */
router.post(
  '/department/:name',
  authenticateToken,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 20 }),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const proof = analytics.analyzeDepartment(name);
      res.json({
        success: true,
        data: {
          department: name,
          proof,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to analyze department performance',
      });
    }
  }
);

/**
 * Get trend analysis
 * Rate limit: 50 requests per hour
 */
router.get(
  '/trends/:period',
  authenticateToken,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 50 }),
  async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      if (!['daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period specified',
        });
      }

      const trends = analytics.generateTrends(period as any);
      res.json({ success: true, data: trends });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate trend analysis',
      });
    }
  }
);

/**
 * Calculate ROI for an idea
 * Rate limit: 30 requests per hour
 */
router.get(
  '/roi/:ideaId',
  authenticateToken,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 30 }),
  async (req: Request, res: Response) => {
    try {
      const { ideaId } = req.params;
      const proof = analytics.calculateROI(ideaId);
      res.json({
        success: true,
        data: {
          ideaId,
          proof,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate ROI',
      });
    }
  }
);

/**
 * Verify department performance
 * Rate limit: 50 requests per hour
 */
router.post(
  '/verify/department',
  authenticateToken,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 50 }),
  async (req: Request, res: Response) => {
    try {
      const { department, targetPerformance } = req.body;
      if (!department || !targetPerformance) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
        });
      }

      const isValid = analytics.verifyDepartmentPerformance(department, BigInt(targetPerformance));

      res.json({
        success: true,
        data: {
          department,
          isValid,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to verify department performance',
      });
    }
  }
);

export default router;
