## 進め方（計画）

### マイルストーン
1. 基盤整備：モノレポ、docs、config、CIスタブ
2. フロント移植：`予約フォーム.html` → Next.js（LIFF）
3. GAS自動化：reservation / availability / reminder（TS + clasp + Actions）
4. 管理者ページ（マルチテナント）：テナント一覧/詳細、設定PR、デプロイ/同期/LIFF更新
5. 監視/運用強化：ヘルスチェック、通知、ロールバック手順、テスト/CI

### ブランチ/環境
- `dev` → 検証環境（Vercel Preview / GAS dev）
- `main` → 本番（Vercel Production / GAS prod）

### 責務分担
- 弊社：全デプロイ・設定・監視を実施
- 顧客：LINEリッチメニューにLIFF URLを登録、運用問い合わせ


