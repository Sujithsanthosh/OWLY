import pool from '../config/db';

/**
 * Database Optimization Strategy
 * Includes: Indexing, Query Optimization, Connection Pooling, Caching
 */

export class DatabaseOptimization {
  /**
   * Create all necessary database indexes for performance
   */
  static async createIndexes(): Promise<void> {
    console.log('🗄️  Creating database indexes...');

    const indexes = [
      // Users table
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
      `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`,

      // Products table
      `CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`,
      `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_products_name_tsvector ON products USING GIN(to_tsvector('english', name))`,
      
      // Orders table
      `CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount)`,
      
      // Order Items table
      `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`,
      
      // Reviews table
      `CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)`,
      
      // Posts table
      `CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id)`,
      `CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`,
      
      // Comments table
      `CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`,
      `CREATE INDEX IF NOT EXISTS idx_comments_creator_id ON comments(creator_id)`,
      
      // Likes table
      `CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`,
      `CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_likes_unique ON likes(post_id, user_id)`,
      
      // Transactions table
      `CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_gateway ON transactions(gateway)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`,
      
      // Wallets table
      `CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)`,
      
      // Wallet Transactions table
      `CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id)`,
      `CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type)`,
      `CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at)`,
      
      // Payouts table
      `CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status)`,
      `CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at)`,
    ];

    for (const index of indexes) {
      try {
        await pool.query(index);
      } catch (error: any) {
        // Index might already exist, which is fine
        if (!error.message.includes('already exists')) {
          console.error(`Error creating index: ${error.message}`);
        }
      }
    }

    console.log('✓ Database indexes created successfully');
  }

  /**
   * Analyze query performance and get execution plans
   */
  static async analyzeQueries(): Promise<void> {
    console.log('📊 Analyzing query performance...');

    const queries = [
      {
        name: 'Get user with orders',
        query: `
          EXPLAIN ANALYZE
          SELECT u.id, u.name, u.email, COUNT(o.id) as order_count
          FROM users u
          LEFT JOIN orders o ON u.id = o.customer_id
          WHERE u.id = $1
          GROUP BY u.id
        `,
      },
      {
        name: 'Get products by category',
        query: `
          EXPLAIN ANALYZE
          SELECT id, name, price, rating, stock
          FROM products
          WHERE category = $1 AND status = 'active'
          ORDER BY created_at DESC
          LIMIT 20
        `,
      },
      {
        name: 'Get seller statistics',
        query: `
          EXPLAIN ANALYZE
          SELECT 
            seller_id,
            COUNT(*) as total_orders,
            SUM(total_amount) as revenue,
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_fulfillment_time
          FROM orders
          WHERE seller_id = $1 AND status = 'completed'
          GROUP BY seller_id
        `,
      },
    ];

    for (const { name, query } of queries) {
      try {
        const result = await pool.query(query, [1]);
        console.log(`✓ ${name}`);
        // Results can be logged to monitoring system
      } catch (error: any) {
        console.error(`✗ ${name}: ${error.message}`);
      }
    }
  }

  /**
   * Vacuum and analyze tables for maintenance
   */
  static async performMaintenance(): Promise<void> {
    console.log('🧹 Performing database maintenance...');

    const tables = [
      'users',
      'products',
      'orders',
      'order_items',
      'reviews',
      'posts',
      'comments',
      'likes',
      'transactions',
      'wallets',
      'wallet_transactions',
      'payouts',
    ];

    for (const table of tables) {
      try {
        // VACUUM: reclaims space
        await pool.query(`VACUUM ANALYZE ${table}`);
        console.log(`✓ Vacuumed and analyzed: ${table}`);
      } catch (error: any) {
        console.error(`Error maintaining ${table}: ${error.message}`);
      }
    }
  }

  /**
   * Get database statistics and health
   */
  static async getDatabaseStats(): Promise<any> {
    const stats = await pool.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_live_tup as row_count,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return stats.rows;
  }

  /**
   * Get connection pool statistics
   */
  static getConnectionPoolStats(): any {
    return {
      idleCount: pool.idleCount || 0,
      totalCount: pool.totalCount || 0,
      waitingCount: pool.waitingCount || 0,
    };
  }

  /**
   * Get slow queries from pg_stat_statements
   */
  static async getSlowQueries(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT
          query,
          calls,
          total_time,
          mean_time,
          max_time
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 20
      `);
      return result.rows;
    } catch (error) {
      console.warn('pg_stat_statements extension not enabled');
      return [];
    }
  }

  /**
   * Enable query planner statistics
   */
  static async enableQueryStatistics(): Promise<void> {
    try {
      await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`);
      console.log('✓ Query statistics enabled');
    } catch (error: any) {
      console.warn(`Could not enable query statistics: ${error.message}`);
    }
  }

  /**
   * Set up automatic query optimization
   */
  static async configureQueryOptimization(): Promise<void> {
    console.log('⚙️  Configuring query optimization...');

    const settings = [
      // Enable statistics collection
      `ALTER DATABASE ${process.env.DB_NAME || 'owly'} SET track_activities = on`,
      `ALTER DATABASE ${process.env.DB_NAME || 'owly'} SET track_counts = on`,
      
      // Parallel query execution
      `ALTER SYSTEM SET max_parallel_workers_per_gather = 2`,
      `ALTER SYSTEM SET max_parallel_workers = 4`,
      `ALTER SYSTEM SET max_parallel_maintenance_workers = 2`,
      
      // Random page cost (for SSD optimization)
      `ALTER SYSTEM SET random_page_cost = 1.1`,
      
      // Work memory (per operation)
      `ALTER SYSTEM SET work_mem = '256MB'`,
      
      // Shared buffers (PostgreSQL cache)
      `ALTER SYSTEM SET shared_buffers = '2GB'`,
    ];

    for (const setting of settings) {
      try {
        await pool.query(setting);
        console.log(`✓ ${setting.split('SET')[1]}`);
      } catch (error: any) {
        // Setting might require restart or superuser
        if (!error.message.includes('must be superuser')) {
          console.warn(`Could not set config: ${error.message}`);
        }
      }
    }

    console.log('✓ Query optimization configured');
  }

  /**
   * Set up materialized views for common queries
   */
  static async createMaterializedViews(): Promise<void> {
    console.log('📈 Creating materialized views...');

    const views = [
      {
        name: 'seller_stats_view',
        query: `
          SELECT
            s.id as seller_id,
            s.name,
            COUNT(DISTINCT p.id) as total_products,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue,
            AVG(r.rating) as avg_rating,
            COUNT(DISTINCT r.id) as total_reviews
          FROM users s
          LEFT JOIN products p ON s.id = p.seller_id
          LEFT JOIN orders o ON s.id = o.seller_id AND o.status = 'completed'
          LEFT JOIN reviews r ON s.id = r.seller_id
          WHERE s.role = 'seller'
          GROUP BY s.id, s.name
        `,
      },
      {
        name: 'product_analytics_view',
        query: `
          SELECT
            p.id,
            p.name,
            p.category,
            COUNT(r.id) as review_count,
            AVG(r.rating) as avg_rating,
            COUNT(DISTINCT o.id) as order_count,
            COALESCE(SUM(oi.quantity), 0) as total_sold,
            p.views,
            p.created_at
          FROM products p
          LEFT JOIN reviews r ON p.id = r.product_id
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id
          GROUP BY p.id
        `,
      },
    ];

    for (const view of views) {
      try {
        await pool.query(`
          CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS
          ${view.query}
        `);
        console.log(`✓ Created materialized view: ${view.name}`);
      } catch (error: any) {
        console.error(`Error creating view ${view.name}: ${error.message}`);
      }
    }
  }

  /**
   * Refresh materialized views (should be run periodically)
   */
  static async refreshMaterializedViews(): Promise<void> {
    const views = ['seller_stats_view', 'product_analytics_view'];

    for (const view of views) {
      try {
        await pool.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
        console.log(`✓ Refreshed view: ${view}`);
      } catch (error: any) {
        console.error(`Error refreshing view ${view}: ${error.message}`);
      }
    }
  }

  /**
   * Set up connection pooling configuration
   */
  static printConnectionPoolConfig(): void {
    console.log('🔄 Connection Pool Configuration:');
    console.log(`   Min connections: ${process.env.DB_POOL_MIN || 2}`);
    console.log(`   Max connections: ${process.env.DB_POOL_MAX || 10}`);
    console.log(`   Idle timeout: ${process.env.DB_POOL_IDLE_TIMEOUT || 30000}ms`);
    console.log(`   Statement timeout: ${process.env.DB_STATEMENT_TIMEOUT || 30000}ms`);
  }

  /**
   * Run complete optimization
   */
  static async runFullOptimization(): Promise<void> {
    console.log('\n=== 🚀 Running Database Optimization Suite ===\n');

    try {
      await this.createIndexes();
      console.log('');
      
      await this.enableQueryStatistics();
      console.log('');
      
      await this.configureQueryOptimization();
      console.log('');
      
      await this.createMaterializedViews();
      console.log('');
      
      this.printConnectionPoolConfig();
      console.log('');
      
      await this.performMaintenance();
      console.log('');
      
      const stats = await this.getDatabaseStats();
      console.log('\n📊 Database Statistics:');
      console.log(stats);
      
      console.log('\n✅ Database optimization completed successfully!\n');
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
    }
  }
}

// Export for use in main app
export default DatabaseOptimization;
