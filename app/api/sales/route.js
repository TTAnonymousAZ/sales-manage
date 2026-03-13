import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // DATABASE_URLがない場合は空配列を返す（ビルドエラー防止）
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }

    // NeonDBからデータを取得
    const data = await sql`SELECT * FROM sales ORDER BY id DESC`;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, price, stock } = await request.json();
    
    const result = await sql`
      INSERT INTO sales (name, price, stock)
      VALUES (${name}, ${price}, ${stock})
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
  }
}