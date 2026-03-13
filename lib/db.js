import { neon } from '@neondatabase/serverless';

// Vercelの環境変数から取得。
// ビルドエラーを防ぐため、存在しない場合のフォールバックを記述
const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder:password@localhost/db');

export default sql;