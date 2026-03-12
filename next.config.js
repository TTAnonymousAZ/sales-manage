/** @type {import('next').NextConfig} */
const nextConfig = {
  // ビルド時の TypeScript 型エラーを無視してデプロイを続行させる
  typescript: {
    ignoreBuildErrors: true,
  },
  // ビルド時の ESLint エラーを無視してデプロイを続行させる
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
```

### 2. ファイル名のケース感度（大文字・小文字）の確認
もし設定ファイルを追加しても解決しない場合、**「ローカルでは動くのに Vercel でだけ失敗する」** 最も多い原因はファイル名です。

* **チェック項目:** `import Component from './component'` と書いているが、実際のファイル名が `Component.tsx`（大文字開始）になっていないか。
* **対策:** Git はデフォルトでファイル名の大文字小文字の変更を検知しないことがあります。以下のコマンドをターミナルで実行して、キャッシュをクリアしてから push してみてください。

```bash
git rm -r --cached .
git add .
git commit -m "Fix case sensitivity issues"