import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: any;
}

// Update delivery location
export const updateDeliveryLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, orderId } = req.body;
    const partnerId = req.user?.userId;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!lat || !lng || !orderId) {
      return sendError(res, null, 'lat, lng, and orderId are required', 400);
    }

    await pool.query(
      'UPDATE orders SET delivery_coords = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [lng, lat, orderId]
    );

    const io = (req.app as any).get('io');
    if (io && orderId) {
      io.to(`order-${orderId}`).emit('delivery-location-updated', {
        lat,
        lng,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, { lat, lng, orderId }, 'Location updated');
  } catch (error: any) {
    console.error('Update delivery location error:', error);
    return sendError(res, error, 'Failed to update location', 500);
  }
};

// Get order delivery status
export const getOrderDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT o.id, o.status, o.delivery_coords, o.estimated_delivery_time,
              u.name as delivery_partner_name, u.phone as delivery_partner_phone, u.avatar_url
       FROM orders o
       LEFT JOIN users u ON o.delivery_partner_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error: any) {
    console.error('Get delivery status error:', error);
    return sendError(res, error, 'Failed to get delivery status', 500);
  }
};

// Get available orders for delivery partner
export const getAvailableOrders = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.userId;
    const { radius = 5 } = req.query;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Get partner location
    const partnerResult = await pool.query(
      'SELECT delivery_coords FROM users WHERE id = $1',
      [partnerId]
    );

    if (partnerResult.rows.length === 0) {
      return sendError(res, null, 'Delivery partner not found', 404);
    }

    const partnerLocation = partnerResult.rows[0].delivery_coords;
    const locationWKT = partnerLocation 
      ? `SRID=4326;POINT(${partnerLocation.x} ${partnerLocation.y})`
      : 'SRID=4326;POINT(0 0)';

    // Find orders within radius (PostGIS)
    const result = await pool.query(
      `SELECT o.id, o.customer_id, o.total_amount, o.delivery_coords, 
              u.name as customer_name, u.phone as customer_phone,
              ST_Distance(o.delivery_coords, $1::geometry) / 1000 as distance_km
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.status = 'ready_for_pickup'
       AND o.delivery_partner_id IS NULL
       AND ST_DWithin(o.delivery_coords, $1::geometry, $2 * 1000)
       ORDER BY distance_km ASC`,
      [locationWKT, radius]
    );

    return sendSuccess(res, {
      available_orders: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get available orders error:', error);
    return sendError(res, error, 'Failed to get available orders', 500);
  }
};

// Accept order for delivery
export const acceptDeliveryOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const partnerId = req.user?.userId;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Check if order exists and is available
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1',
      [orderId]
    );

    if (checkResult.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    if (checkResult.rows[0].status !== 'ready_for_pickup') {
      return sendError(res, null, 'Order is not available for pickup', 400);
    }

    // Assign delivery partner
    const result = await pool.query(
      `UPDATE orders
       SET delivery_partner_id = $1, status = 'out_for_delivery', updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, delivery_partner_id`,
      [partnerId, orderId]
    );

    const io = (req.app as any).get('io');
    if (io) {
      io.to(`order-${orderId}`).emit('order-assigned-to-delivery', {
        orderId,
        partnerId,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, result.rows[0], 'Order accepted', 201);
  } catch (error: any) {
    console.error('Accept delivery order error:', error);
    return sendError(res, error, 'Failed to accept order', 500);
  }
};

// Update order status
export const updateOrderDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const partnerId = req.user?.userId;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!status) {
      return sendError(res, null, 'Status is required', 400);
    }

    const validStatuses = ['out_for_delivery', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return sendError(res, null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND delivery_partner_id = $3
       RETURNING id, status, updated_at`,
      [status, orderId, partnerId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Order not found or not assigned to you', 404);
    }

    const io = (req.app as any).get('io');
    if (io) {
      io.to(`order-${orderId}`).emit('delivery-status-updated', {
        orderId,
        status,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, result.rows[0], 'Status updated');
  } catch (error: any) {
    console.error('Update delivery status error:', error);
    return sendError(res, error, 'Failed to update status', 500);
  }
};

// Get delivery partner's active deliveries
export const getMyDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.userId;
    const { status = 'out_for_delivery' } = req.query;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    let query = `SELECT o.id, o.customer_id, o.total_amount, o.status, o.delivery_coords,
                        u.name as customer_name, u.phone as customer_phone, u.avatar_url,
                        a.address as delivery_address
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 LEFT JOIN addresses a ON o.delivery_address_id = a.id
                 WHERE o.delivery_partner_id = $1`;
    
    const params: any[] = [partnerId];

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.updated_at DESC`;

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      deliveries: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get my deliveries error:', error);
    return sendError(res, error, 'Failed to get deliveries', 500);
  }
};

// Get delivery partner earnings
export const getDeliveryEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.userId;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_deliveries,
         SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_deliveries,
         COALESCE(SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END), 0) as total_earnings
       FROM orders
       WHERE delivery_partner_id = $1`,
      [partnerId]
    );

    const earnings = result.rows[0];

    return sendSuccess(res, {
      totalDeliveries: earnings.total_deliveries,
      completedDeliveries: earnings.completed_deliveries,
      failedDeliveries: earnings.failed_deliveries,
      totalEarnings: earnings.total_earnings,
      averageEarningsPerDelivery: earnings.total_deliveries > 0 ? (earnings.total_earnings / earnings.completed_deliveries).toFixed(2) : 0,
    });
  } catch (error: any) {
    console.error('Get delivery earnings error:', error);
    return sendError(res, error, 'Failed to get earnings', 500);
  }
};

// Get delivery partner statistics
export const getDeliveryStats = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.userId;

    if (!partnerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_orders,
         AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_delivery_time_minutes,
         COUNT(CASE WHEN status = 'delivered' THEN 1 END)::float / COUNT(*) * 100 as completion_rate
       FROM orders
       WHERE delivery_partner_id = $1`,
      [partnerId]
    );

    const stats = result.rows[0];

    return sendSuccess(res, {
      totalOrders: stats.total_orders || 0,
      averageDeliveryTimeMinutes: Math.round(stats.avg_delivery_time_minutes || 0),
      completionRate: stats.completion_rate ? Math.round(stats.completion_rate) : 0,
      rating: 4.8, // Would come from a ratings table
    });
  } catch (error: any) {
    console.error('Get delivery stats error:', error);
    return sendError(res, error, 'Failed to get statistics', 500);
  }
};

// Update availability
export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { available } = req.body;
    const partnerId = req.user?.userId;

    if (available === undefined) {
      return sendError(res, null, 'Available status is required', 400);
    }

    await pool.query(
      'UPDATE users SET metadata = COALESCE(metadata, \'{}\'::jsonb) || $1::jsonb WHERE id = $2',
      [JSON.stringify({ delivery_available: available }), partnerId]
    );

    return sendSuccess(res, { available }, 'Availability updated');
  } catch (error: any) {
    console.error('Update availability error:', error);
    return sendError(res, error, 'Failed to update availability', 500);
  }
};
