## プロジェクト概要（弊社管理・顧客提供型）

本プロジェクトは、LINE公式アカウントを持つ複数の顧客店舗（マルチテナント）に対して、弊社が運用・保守する予約サービスを提供するためのリポジトリです。

### 提供物（顧客向け）
- 予約フォーム（LIFF）本番URL
- LIFF URL/QR（リッチメニュー・ボタン登録用）
- （必要に応じて）GAS Webhook/空きAPIのURLは弊社が設定代行

### 管理（弊社）
- 管理者ページ（テナント一覧/詳細、設定編集→PR、デプロイ/同期/LIFF更新、状態表示）
- CI/CD（Vercel/GAS/clasp）
- Secrets/Script Properties 管理
- 運用監視/ロールバック

### リポジトリ構成
`README.md` と `docs/`、`packages/config/` を参照。


