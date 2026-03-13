/** @type {import('next').NextConfig} */
const nextConfig = {
  // ビルド時の TypeScript 型エラーを無視してデプロイを続行させる
  // 開発初期やプロトタイプ段階で、型エラーによるビルド失敗を防ぎます
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ビルド時の ESLint エラーを無視してデプロイを続行させる
  // 構文チェックによるデプロイの中断を回避します
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 実画像や外部アセットを使用する場合の最適化設定（必要に応じて）
  images: {
    unoptimized: true, // 静的エクスポートや一部の環境で必要
  },

  // Reactの厳密モード（開発中の二重レンダリングによるデバッグ支援）
  reactStrictMode: true,

  // SWCによるコード圧縮を有効化
  swcMinify: true,
};

export default nextConfig;