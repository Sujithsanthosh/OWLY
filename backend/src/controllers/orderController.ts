import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';
import { createRazorpayOrder, createStripePaymentIntent, verifyRazorpaySignature } from '../services/paymentService';

export interface AuthRequest extends Request {
  user?: any;
}

// Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, total_amount, delivery_address, payment_method = 'razorpay', currency = 'INR' } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!items || items.length === 0 || !total_amount) {
      return sendError(res, null, 'Items and total amount are required', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create Order in DB first with 'pending' status
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, delivery_address, payment_method, status, payment_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, created_at`,
        [user_id, total_amount, delivery_address, payment_method, 'pending', 'unpaid']
      );

      const orderId = orderResult.rows[0].id;

      // Create Order Items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_type, quantity, price_at_purchase, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [orderId, item.product_id, item.product_type || 'product', item.quantity, item.price]
        );
      }

      let paymentData = {};

      if (payment_method === 'razorpay') {
        try {
          const razorpayOrder = await createRazorpayOrder(total_amount, currency);
          paymentData = {
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
          };
          // Update order with razorpay order id
          await client.query(
            'UPDATE orders SET razorpay_order_id = $1 WHERE id = $2',
            [razorpayOrder.id, orderId]
          );
        } catch (razorpayError) {
          console.error('Razorpay error:', razorpayError);
          // Continue with order creation, payment can be retried
        }
      } else if (payment_method === 'stripe') {
        try {
          const paymentIntent = await createStripePaymentIntent(total_amount, currency.toLowerCase());
          paymentData = {
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
          };
          await client.query(
            'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
            [paymentIntent.id, orderId]
          );
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);
          // Continue with order creation
        }
      }

      await client.query('COMMIT');

      return sendSuccess(res, {
        order_id: orderId,
        payment_data: paymentData,
        message: 'Order created successfully'
      }, 'Order created successfully', 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    return sendError(res, error, 'Failed to create order', 500);
  }
};

// Confirm payment
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { order_id, payment_id, signature, razorpay_order_id, payment_intent_id } = req.body;

    if (!order_id) {
      return sendError(res, null, 'Order ID is required', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (razorpay_order_id && signature && payment_id) {
        const isValid = verifyRazorpaySignature(razorpay_order_id, payment_id, signature);
        if (!isValid) {
          return sendError(res, null, 'Invalid payment signature', 400);
        }

        await client.query(
          `UPDATE orders 
           SET status = $1, payment_status = $2, payment_id = $3, updated_at = NOW()
           WHERE id = $4`,
          ['confirmed', 'paid', payment_id, order_id]
        );
      } else if (payment_intent_id) {
        // For Stripe
        await client.query(
          `UPDATE orders 
           SET status = $1, payment_status = $2, payment_id = $3, updated_at = NOW()
           WHERE id = $4`,
          ['confirmed', 'paid', payment_intent_id, order_id]
        );
      }

      await client.query('COMMIT');

      return sendSuccess(res, { message: 'Payment confirmed and order placed' }, 'Payment confirmed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    return sendError(res, error, 'Failed to confirm payment', 500);
  }
};

// Get user's orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    return sendSuccess(res, {
      orders: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return sendError(res, error, 'Failed to get orders', 500);
  }
};

// Get order details
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (orderResult.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return sendSuccess(res, {
      ...order,
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return sendError(res, error, 'Failed to get order', 500);
  }
};

// Update order status (seller/admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, null, 'Status is required', 400);
    }

    // Valid statuses
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    return sendError(res, error, 'Failed to update order status', 500);
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (orderResult.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    const order = orderResult.rows[0];

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return sendError(res, null, `Cannot cancel order with status: ${order.status}`, 400);
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    return sendSuccess(res, result.rows[0], 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    return sendError(res, error, 'Failed to cancel order', 500);
  }
};
