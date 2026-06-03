import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 20, community_id } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (community_id) {
      query += ` AND community_id = $${paramIndex++}`;
      params.push(community_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      products: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return sendError(res, error, 'Failed to get products', 500);
  }
};

// Get single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Product not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    return sendError(res, error, 'Failed to get product', 500);
  }
};

// Create product (Fashion)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, images, stock_quantity, community_id, metadata } = req.body;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!name || !price) {
      return sendError(res, null, 'Name and price are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO products (seller_id, name, description, price, category, images, stock_quantity, community_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, name, description, price, category, created_at`,
      [seller_id, name, description, price, category, images || [], stock_quantity || 0, community_id, metadata || {}]
    );

    return sendSuccess(res, result.rows[0], 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return sendError(res, error, 'Failed to create product', 500);
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, stock_quantity, metadata } = req.body;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const product = await pool.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (product.rows.length === 0 || product.rows[0].seller_id !== seller_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           images = COALESCE($5, images),
           stock_quantity = COALESCE($6, stock_quantity),
           metadata = COALESCE($7, metadata)
       WHERE id = $8
       RETURNING id, name, description, price, category, stock_quantity`,
      [name, description, price, category, images, stock_quantity, metadata, id]
    );

    return sendSuccess(res, result.rows[0], 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    return sendError(res, error, 'Failed to update product', 500);
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const product = await pool.query('SELECT seller_id FROM products WHERE id = $1', [id]);
    if (product.rows.length === 0 || product.rows[0].seller_id !== seller_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return sendError(res, error, 'Failed to delete product', 500);
  }
};

// Get seller products
export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const seller_id = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [seller_id, limit, offset]
    );

    return sendSuccess(res, {
      products: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    return sendError(res, error, 'Failed to get seller products', 500);
  }
};

// Food Items
export const createFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, image_url, is_vegetarian, nutritional_info } = req.body;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!name || !price) {
      return sendError(res, null, 'Name and price are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO food_items (seller_id, name, description, price, category, image_url, is_vegetarian, nutritional_info, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, name, description, price, category, created_at`,
      [seller_id, name, description, price, category, image_url, is_vegetarian, nutritional_info || {}]
    );

    return sendSuccess(res, result.rows[0], 'Food item created successfully', 201);
  } catch (error) {
    console.error('Create food item error:', error);
    return sendError(res, error, 'Failed to create food item', 500);
  }
};

export const getFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = 'SELECT * FROM food_items WHERE is_available = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      food_items: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get food items error:', error);
    return sendError(res, error, 'Failed to get food items', 500);
  }
};

export const updateFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_vegetarian, is_available, nutritional_info } = req.body;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const item = await pool.query('SELECT seller_id FROM food_items WHERE id = $1', [id]);
    if (item.rows.length === 0 || item.rows[0].seller_id !== seller_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE food_items 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           is_vegetarian = COALESCE($6, is_vegetarian),
           is_available = COALESCE($7, is_available),
           nutritional_info = COALESCE($8, nutritional_info)
       WHERE id = $9
       RETURNING id, name, price, category`,
      [name, description, price, category, image_url, is_vegetarian, is_available, nutritional_info, id]
    );

    return sendSuccess(res, result.rows[0], 'Food item updated successfully');
  } catch (error) {
    console.error('Update food item error:', error);
    return sendError(res, error, 'Failed to update food item', 500);
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const seller_id = req.user?.userId;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const item = await pool.query('SELECT seller_id FROM food_items WHERE id = $1', [id]);
    if (item.rows.length === 0 || item.rows[0].seller_id !== seller_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    await pool.query('DELETE FROM food_items WHERE id = $1', [id]);

    return sendSuccess(res, null, 'Food item deleted successfully');
  } catch (error) {
    console.error('Delete food item error:', error);
    return sendError(res, error, 'Failed to delete food item', 500);
  }
};

export const getSellerFoodItems = async (req: AuthRequest, res: Response) => {
  try {
    const seller_id = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!seller_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      'SELECT * FROM food_items WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [seller_id, limit, offset]
    );

    return sendSuccess(res, {
      food_items: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get seller food items error:', error);
    return sendError(res, error, 'Failed to get seller food items', 500);
  }
};
