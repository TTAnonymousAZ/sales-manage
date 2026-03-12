import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

// Vercel環境（Production）ではSSLが必要な場合が多いため、条件分岐を含めると安全です
const sql = postgres(connectionString, {
  ssl: 'require',
  // 接続が不安定な場合のタイムアウト設定など
  connect_timeout: 30,
});

export default sql;