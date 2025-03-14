import Stripe from 'stripe';
import { AuditLogger } from '../security/AuditLogger';

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId: string;
  paymentMethodId: string;
  metadata: Record<string, string>;
}

export class PaymentProcessor {
  private readonly stripe: Stripe;
  private readonly auditLogger: AuditLogger;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.auditLogger = new AuditLogger();
  }

  /**
   * Create a payment intent for a subscription
   */
  public async createSubscriptionPayment(
    customerId: string,
    amount: number,
    currency: string,
    metadata: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_intent_created', {
        paymentIntentId: paymentIntent.id,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerId: paymentIntent.customer as string,
        paymentMethodId: paymentIntent.payment_method as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_intent_failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Create a payment intent for a one-time payment
   */
  public async createOneTimePayment(
    amount: number,
    currency: string,
    metadata: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.auditLogger.logSecurityEvent({} as any, 'system', 'one_time_payment_created', {
        paymentIntentId: paymentIntent.id,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerId: paymentIntent.customer as string,
        paymentMethodId: paymentIntent.payment_method as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'one_time_payment_failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  public async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_confirmed', {
        paymentIntentId,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerId: paymentIntent.customer as string,
        paymentMethodId: paymentIntent.payment_method as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_confirmation_failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get payment intent details
   */
  public async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerId: paymentIntent.customer as string,
        paymentMethodId: paymentIntent.payment_method as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_intent_retrieval_failed', {
        error: (error as Error).message,
        paymentIntentId,
      });
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  public async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_refunded', {
        paymentIntentId,
        refundId: refund.id,
      });

      return this.getPaymentIntent(paymentIntentId);
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'payment_refund_failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
