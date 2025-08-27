## 管理者ページ API 設計（MVP, multi-tenant）

### 認証
- Google OAuth（社内メールドメイン限定） or Basic + IP 制限

### エンドポイント
- POST /api/deploy/frontend { target, env, tenantId? }
- POST /api/deploy/gas { app, env, tenantId }
- POST /api/liff/update { tenantId, env, url }  # LIFF view URL 更新
- POST /api/config/pr { tenantId, path, patch }  # テナント別設定のPR作成
- GET  /api/tenants        # テナント一覧
- GET  /api/tenants/{id}   # テナント詳細
- GET  /api/status?tenantId # テナント別の状態

### フロー
1) 設定編集 → PR作成 → マージ → 自動デプロイ
2) 手動デプロイ → workflow_dispatch を起動 → 結果をポーリング


