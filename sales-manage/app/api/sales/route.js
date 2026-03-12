import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sales = await sql`SELECT * FROM sales_data ORDER BY sale_year DESC, sale_month DESC, sale_day DESC, id DESC`;
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await sql`
      INSERT INTO sales_data (product_name, amount, sale_year, sale_month, sale_day, category)
      VALUES (${data.product_name}, ${data.amount}, ${data.sale_year}, ${data.sale_month}, ${data.sale_day}, ${data.category})
      RETURNING *`;
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
