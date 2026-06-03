import pool from '../config/db';

export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const runQuery = async (query: string, params?: any[]) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getOne = async (query: string, params?: any[]) => {
  const result = await runQuery(query, params);
  return result.rows[0] || null;
};

export const getAll = async (query: string, params?: any[]) => {
  const result = await runQuery(query, params);
  return result.rows;
};

export const insertOne = async (query: string, params?: any[]) => {
  const result = await runQuery(query, params);
  return result.rows[0];
};

export const updateOne = async (query: string, params?: any[]) => {
  const result = await runQuery(query, params);
  return result.rows[0];
};

export const deleteOne = async (query: string, params?: any[]) => {
  const result = await runQuery(query, params);
  return result.rowCount;
};
