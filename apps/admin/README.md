## apps/admin（弊社用 管理者ページ）

設定編集（PR化）、Secrets/Properties更新、デプロイ実行、状態可視化。

### エンドポイント
- `GET /api/health` ヘルスチェック（認証バイパス）
- `POST /api/deploy/gas` GAS デプロイ（GitHub Actions の `workflow_dispatch` を呼び出し）
- `POST /api/liff/update` LIFF エンドポイント更新
- `POST /api/config/pr` 設定PR作成
- `GET /api/tenants` / `GET /api/tenants/[id]` / `GET /api/tenants/[id]/status`
- `GET /api/tenants/[id]/deploys` / `GET /api/tenants/[id]/gas/deploys`
- `POST /api/tenants/[id]/gas/deploy`（最新/指定versionを再デプロイ）

### 認証/アクセス制御
- Basic 認証 + IP 許可リスト（ミドルウェア）
- 環境変数：
  - `ADMIN_IP_ALLOWLIST` 例: `203.0.113.1,198.51.100.2`（未設定時は無制限）
  - `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASS`（未設定時は無効＝バイパス）

### 運用の流れ
1. テナント選択 → ステータス確認
2. 設定変更が必要な場合：`PR作成` で `packages/config/tenants/<tenantId>/` を編集
3. デプロイ：`GAS Deploy`（最新/指定version）/ `LIFF更新`
4. 疎通確認：`状態再取得`（URL HEAD / GAS Deploys / Secrets presence）

