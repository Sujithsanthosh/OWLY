import { Request, Response } from 'express';
import { verifyRazorpaySignature } from '../services/paymentService';
import pool from '../config/db';
import crypto from 'crypto';

// Razorpay Webhook Handler
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const { event, payload } = req.body;

    if (!event || !payload) {
      return res.status(400).json({
        success: false,
        message: 'Missing event or payload',
      });
    }

    // Verify Razorpay signature
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);
    
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Razorpay signature');
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed',
      });
    }

    const client = await pool.connect();

    try {
      switch (event) {
        case 'payment.authorized':
          await handleRazorpayPaymentAuthorized(payload, client);
          break;
        case 'payment.failed':
          await handleRazorpayPaymentFailed(payload, client);
          break;
        case 'payment.captured':
          await handleRazorpayPaymentCaptured(payload, client);
          break;
        case 'refund.created':
          await handleRazorpayRefund(payload, client);
          break;
        default:
          console.log(`Unhandled Razorpay event: ${event}`);
      }

      res.status(200).json({ success: true, message: 'Webhook processed' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
};

// Handle Razorpay Payment Authorized
const handleRazorpayPaymentAuthorized = async (payload: any, client: any) => {
  const payment = payload.payment;
  const { id: paymentId, order_id: orderId, amount, status } = payment;

  // Update order payment status
  await client.query(
    `UPDATE orders SET 
      payment_status = 'pending_capture',
      razorpay_payment_id = $1,
      razorpay_order_id = $2,
      updated_at = NOW()
     WHERE id = $3`,
    [paymentId, orderId, orderId.split('_')[0]]
  );

  console.log(`Payment authorized: ${paymentId} for order ${orderId}`);
};

// Handle Razorpay Payment Captured
const handleRazorpayPaymentCaptured = async (payload: any, client: any) => {
  const payment = payload.payment;
  const { id: paymentId, order_id: orderId, amount } = payment;

  // Update order to completed
  await client.query(
    `UPDATE orders SET 
      payment_status = 'paid',
      razorpay_payment_id = $1,
      status = 'confirmed',
      updated_at = NOW()
     WHERE razorpay_order_id = $2`,
    [paymentId, orderId]
  );

  // Get order details to update inventory
  const orderRes = await client.query('SELECT * FROM orders WHERE razorpay_order_id = $1', [orderId]);
  if (orderRes.rows.length > 0) {
    const order = orderRes.rows[0];

    // Update inventory for each product in the order
    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of itemsRes.rows) {
      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Log transaction
    await client.query(
      `INSERT INTO transactions (order_id, amount, type, status, gateway, gateway_transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [order.id, amount / 100, 'payment', 'success', 'razorpay', paymentId]
    );
  }

  console.log(`Payment captured: ${paymentId} for order ${orderId}`);
};

// Handle Razorpay Payment Failed
const handleRazorpayPaymentFailed = async (payload: any, client: any) => {
  const payment = payload.payment;
  const { id: paymentId, order_id: orderId, error_description } = payment;

  // Update order payment status
  await client.query(
    `UPDATE orders SET 
      payment_status = 'failed',
      razorpay_payment_id = $1,
      notes = $2,
      updated_at = NOW()
     WHERE razorpay_order_id = $3`,
    [paymentId, error_description, orderId]
  );

  // Log failed transaction
  await client.query(
    `INSERT INTO transactions (order_id, type, status, gateway, gateway_transaction_id, notes)
     VALUES (
       (SELECT id FROM orders WHERE razorpay_order_id = $1),
       $2, $3, $4, $5, $6
     )`,
    [orderId, 'payment', 'failed', 'razorpay', paymentId, error_description]
  );

  console.log(`Payment failed: ${paymentId} for order ${orderId}. Reason: ${error_description}`);
};

// Handle Razorpay Refund
const handleRazorpayRefund = async (payload: any, client: any) => {
  const refund = payload.refund;
  const { id: refundId, payment_id: paymentId, amount, status } = refund;

  // Get order by payment ID
  const orderRes = await client.query(
    'SELECT * FROM orders WHERE razorpay_payment_id = $1',
    [paymentId]
  );

  if (orderRes.rows.length > 0) {
    const order = orderRes.rows[0];

    // Update order if full refund
    if (status === 'processed') {
      await client.query(
        `UPDATE orders SET 
          payment_status = 'refunded',
          status = 'cancelled',
          updated_at = NOW()
         WHERE id = $1`,
        [order.id]
      );

      // Log refund transaction
      await client.query(
        `INSERT INTO transactions (order_id, amount, type, status, gateway, gateway_transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, amount / 100, 'refund', 'success', 'razorpay', refundId]
      );

      console.log(`Refund processed: ${refundId} for order ${order.id}`);
    }
  }
};

// Stripe Webhook Handler
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    const event = req.body;

    // In production, verify the signature:
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    const client = await pool.connect();

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handleStripePaymentIntentSucceeded(event.data.object, client);
          break;
        case 'payment_intent.payment_failed':
          await handleStripePaymentIntentFailed(event.data.object, client);
          break;
        case 'charge.refunded':
          await handleStripeChargeRefunded(event.data.object, client);
          break;
        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
      }

      res.json({ received: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

// Handle Stripe Payment Intent Succeeded
const handleStripePaymentIntentSucceeded = async (paymentIntent: any, client: any) => {
  const { id: intentId, amount, metadata } = paymentIntent;
  const orderId = metadata?.order_id;

  if (!orderId) {
    console.warn('No order ID in payment intent metadata');
    return;
  }

  // Update order to completed
  await client.query(
    `UPDATE orders SET 
      payment_status = 'paid',
      stripe_payment_intent_id = $1,
      status = 'confirmed',
      updated_at = NOW()
     WHERE id = $2`,
    [intentId, orderId]
  );

  // Update inventory
  const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  for (const item of itemsRes.rows) {
    await client.query(
      `UPDATE products SET stock = stock - $1 WHERE id = $2`,
      [item.quantity, item.product_id]
    );
  }

  // Log transaction
  await client.query(
    `INSERT INTO transactions (order_id, amount, type, status, gateway, gateway_transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [orderId, amount / 100, 'payment', 'success', 'stripe', intentId]
  );

  console.log(`Stripe payment succeeded: ${intentId} for order ${orderId}`);
};

// Handle Stripe Payment Intent Failed
const handleStripePaymentIntentFailed = async (paymentIntent: any, client: any) => {
  const { id: intentId, metadata, last_payment_error } = paymentIntent;
  const orderId = metadata?.order_id;

  if (!orderId) {
    console.warn('No order ID in failed payment intent metadata');
    return;
  }

  // Update order payment status
  await client.query(
    `UPDATE orders SET 
      payment_status = 'failed',
      stripe_payment_intent_id = $1,
      notes = $2,
      updated_at = NOW()
     WHERE id = $3`,
    [intentId, last_payment_error?.message || 'Unknown error', orderId]
  );

  // Log failed transaction
  await client.query(
    `INSERT INTO transactions (order_id, type, status, gateway, gateway_transaction_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [orderId, 'payment', 'failed', 'stripe', intentId, last_payment_error?.message]
  );

  console.log(`Stripe payment failed: ${intentId} for order ${orderId}`);
};

// Handle Stripe Charge Refunded
const handleStripeChargeRefunded = async (charge: any, client: any) => {
  const { id: chargeId, amount, refunded, metadata } = charge;
  const orderId = metadata?.order_id;

  if (!orderId) {
    console.warn('No order ID in charge metadata');
    return;
  }

  if (refunded) {
    // Update order if fully refunded
    await client.query(
      `UPDATE orders SET 
        payment_status = 'refunded',
        status = 'cancelled',
        updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );

    // Log refund transaction
    await client.query(
      `INSERT INTO transactions (order_id, amount, type, status, gateway, gateway_transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, amount / 100, 'refund', 'success', 'stripe', chargeId]
    );

    console.log(`Stripe refund processed: ${chargeId} for order ${orderId}`);
  }
};
