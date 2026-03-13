/**
 * 販売管理システム (Sales Management System) - DB Operations
 * Author: T.T Anonymous AZ
 */

import { neon, neonConfig } from '@neondatabase/serverless';

// サーバーレス環境最適化
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL);

/**
 * 1. データベース初期化 (Migration)
 */
export async function initDatabase() {
  try {
    console.log("Initializing Database for '販売管理'...");

    // 顧客テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 販売実績テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        sale_date DATE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        category TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        amount INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);`;
    
    return { success: true, message: "Database initialized successfully." };
  } catch (error) {
    console.error("DB Init Error:", error);
    throw error;
  }
}

/**
 * 2. 販売実績の登録
 */
export async function registerSale({ date, customerName, category, product, quantity, amount }) {
  try {
    const [customer] = await sql`
      INSERT INTO customers (name)
      VALUES (${customerName})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `;

    const [sale] = await sql`
      INSERT INTO sales (sale_date, customer_id, category, product_name, quantity, amount)
      VALUES (${date}, ${customer.id}, ${category}, ${product}, ${quantity}, ${amount})
      RETURNING id;
    `;

    return { success: true, saleId: sale.id };
  } catch (error) {
    console.error("Register Sale Error:", error);
    throw error;
  }
}

/**
 * 3. 集計データ取得
 */
export async function getDashboardData(year) {
  try {
    const monthlySales = await sql`
      SELECT 
        EXTRACT(MONTH FROM sale_date) as month,
        SUM(amount) as total_amount
      FROM sales
      WHERE EXTRACT(YEAR FROM sale_date) = ${year}
      GROUP BY month
      ORDER BY month;
    `;

    const categoryStats = await sql`
      SELECT 
        category,
        SUM(amount) as total_amount,
        SUM(quantity) as total_quantity
      FROM sales
      GROUP BY category;
    `;

    return {
      monthlySales,
      categoryStats
    };
  } catch (error) {
    console.error("Fetch Analysis Error:", error);
    throw error;
  }
}

/**
 * 4. 販売実績一覧の取得
 */
export async function getSalesHistory() {
  try {
    return await sql`
      SELECT 
        s.id,
        s.sale_date as date,
        c.name as customer,
        s.category,
        s.product_name as product,
        s.quantity,
        s.amount
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.sale_date DESC, s.id DESC;
    `;
  } catch (error) {
    console.error("Fetch History Error:", error);
    return [];
  }
}