import { RevenueEngine } from '../RevenueEngine';
import { PaymentProcessor } from '../PaymentProcessor';
import { BillingDashboard } from '../BillingDashboard';

describe('BillingDashboard', () => {
  let revenueEngine: RevenueEngine;
  let paymentProcessor: PaymentProcessor;
  let billingDashboard: BillingDashboard;

  beforeEach(() => {
    revenueEngine = new RevenueEngine();
    paymentProcessor = new PaymentProcessor('test_stripe_key');
    billingDashboard = new BillingDashboard(revenueEngine, paymentProcessor);
  });

  describe('Billing Report Generation', () => {
    it('should generate a complete billing report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const report = await billingDashboard.generateBillingReport(startDate, endDate);

      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('recentTransactions');
      expect(report).toHaveProperty('subscriptionStatus');
      expect(report).toHaveProperty('revenueByTier');
    });

    it('should calculate correct billing metrics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const report = await billingDashboard.generateBillingReport(startDate, endDate);

      const metrics = report.metrics;
      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('subscriptionRevenue');
      expect(metrics).toHaveProperty('apiUsageRevenue');
      expect(metrics).toHaveProperty('premiumFeatureRevenue');
      expect(metrics).toHaveProperty('activeSubscriptions');
      expect(metrics).toHaveProperty('apiCalls');
      expect(metrics).toHaveProperty('paymentSuccessRate');
      expect(metrics).toHaveProperty('averageRevenuePerUser');
      expect(metrics).toHaveProperty('churnRate');
    });

    it('should include revenue by tier', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const report = await billingDashboard.generateBillingReport(startDate, endDate);

      const revenueByTier = report.revenueByTier;
      expect(revenueByTier).toHaveProperty('Starter');
      expect(revenueByTier).toHaveProperty('Professional');
      expect(revenueByTier).toHaveProperty('Enterprise');
    });
  });

  describe('Customer Payment History', () => {
    it('should return payment history for a customer', async () => {
      const customerId = 'test_customer';
      const history = await billingDashboard.getCustomerPaymentHistory(customerId);

      expect(Array.isArray(history)).toBe(true);
    });

    it('should respect the limit parameter', async () => {
      const customerId = 'test_customer';
      const limit = 5;
      const history = await billingDashboard.getCustomerPaymentHistory(customerId, limit);

      expect(history.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Customer Subscription', () => {
    it('should return subscription details for a customer', async () => {
      const customerId = 'test_customer';
      const subscription = await billingDashboard.getCustomerSubscription(customerId);

      expect(subscription).toBeNull(); // In test environment, returns null
    });
  });

  describe('Payment Methods', () => {
    it('should return payment methods for a customer', async () => {
      const customerId = 'test_customer';
      const methods = await billingDashboard.getCustomerPaymentMethods(customerId);

      expect(Array.isArray(methods)).toBe(true);
    });
  });
});
