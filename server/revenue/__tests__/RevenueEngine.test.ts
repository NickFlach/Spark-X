import { RevenueEngine } from '../RevenueEngine';

describe('RevenueEngine', () => {
  let revenueEngine: RevenueEngine;

  beforeEach(() => {
    revenueEngine = new RevenueEngine();
  });

  describe('Subscription Revenue', () => {
    it('should calculate correct subscription revenue for Starter tier', () => {
      const revenue = revenueEngine.calculateSubscriptionRevenue('Starter', 12);
      expect(revenue).toBe(1188); // 99 * 12
    });

    it('should calculate correct subscription revenue for Professional tier', () => {
      const revenue = revenueEngine.calculateSubscriptionRevenue('Professional', 12);
      expect(revenue).toBe(3588); // 299 * 12
    });

    it('should calculate correct subscription revenue for Enterprise tier', () => {
      const revenue = revenueEngine.calculateSubscriptionRevenue('Enterprise', 12);
      expect(revenue).toBe(11988); // 999 * 12
    });

    it('should throw error for invalid tier', () => {
      expect(() => {
        revenueEngine.calculateSubscriptionRevenue('Invalid', 12);
      }).toThrow('Invalid subscription tier');
    });
  });

  describe('API Revenue', () => {
    it('should calculate correct API revenue for Starter tier', () => {
      const revenue = revenueEngine.calculateApiRevenue('Starter', 5000);
      expect(revenue).toBe(50); // 5 * 10 (5 blocks of 1000 calls at $10 per block)
    });

    it('should calculate correct API revenue for Professional tier', () => {
      const revenue = revenueEngine.calculateApiRevenue('Professional', 5000);
      expect(revenue).toBe(40); // 5 * 8 (5 blocks of 1000 calls at $8 per block)
    });

    it('should calculate correct API revenue for Enterprise tier', () => {
      const revenue = revenueEngine.calculateApiRevenue('Enterprise', 5000);
      expect(revenue).toBe(25); // 5 * 5 (5 blocks of 1000 calls at $5 per block)
    });

    it('should throw error for invalid tier', () => {
      expect(() => {
        revenueEngine.calculateApiRevenue('Invalid', 5000);
      }).toThrow('Invalid tier for API rates');
    });
  });

  describe('Premium Features', () => {
    it('should calculate correct revenue for single premium feature', () => {
      const revenue = revenueEngine.calculatePremiumFeatureRevenue(['Custom Integration']);
      expect(revenue).toBe(5000);
    });

    it('should calculate correct revenue for multiple premium features', () => {
      const revenue = revenueEngine.calculatePremiumFeatureRevenue([
        'Custom Integration',
        'Advanced Security',
        'Training',
      ]);
      expect(revenue).toBe(9000); // 5000 + 3000 + 1000
    });

    it('should handle unknown premium features gracefully', () => {
      const revenue = revenueEngine.calculatePremiumFeatureRevenue(['Unknown Feature']);
      expect(revenue).toBe(0);
    });
  });

  describe('Subscription Tiers', () => {
    it('should return all subscription tiers', () => {
      const tiers = revenueEngine.getSubscriptionTiers();
      expect(tiers).toHaveLength(3);
      expect(tiers.map(t => t.name)).toEqual(['Starter', 'Professional', 'Enterprise']);
    });
  });

  describe('Premium Features', () => {
    it('should return all premium features', () => {
      const features = revenueEngine.getPremiumFeatures();
      expect(features.size).toBe(4);
      expect(features.get('Custom Integration')).toBe(5000);
      expect(features.get('Advanced Security')).toBe(3000);
      expect(features.get('Data Migration')).toBe(2000);
      expect(features.get('Training')).toBe(1000);
    });
  });
});
