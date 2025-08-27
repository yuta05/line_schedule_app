## 運用手順（弊社向け）
### 管理者ページの使い方（マルチテナント）
1) テナント選択
   - 画面上部の Tenant から対象店舗を選択（一覧は `packages/config/tenants/*/mapping.json` を基に表示）
2) GAS デプロイ
   - availability/reservation/reminder を dev/prod へ `workflow_dispatch`で実行
3) LIFF エンドポイント更新
   - tenantId + env + URL を入力し `更新`。LINE DevelopersのLIFF view URL が変更されます
4) 設定PR作成
   - path と内容（JSON）を入力し `PRを作成`。レビュー後にマージで反映（CI/自動デプロイ）
5) テナント詳細
   - Secrets/Endpoints の有無と値（URL/ID、トークンは伏字）を確認
   - 最新デプロイの疎通状況（status/ms/Last-Modified/Date）を確認
   - GAS デプロイ一覧を表示し、`最新verに再デプロイ` または `指定verにデプロイ` を実行
   - `状態再取得` で即時更新


### 初回セットアップ
1. LINE Developers：チャネル作成、LIFF作成、`LIFF_ID`/`CHANNEL_ACCESS_TOKEN`取得
2. Vercel：`apps/frontend`/`apps/admin` を登録、環境変数投入
3. GAS：3プロジェクト作成、`scriptId`控え、サービスアカウント権限付与
4. GitHub：Secrets登録（LINE/GAS/Vercel/Calendar）

#### 初回セットアップ 詳細チェックリスト（テナント/環境ごと）
- GitHub Secrets（命名規約に沿って登録）
  - `GOOGLE_CREDENTIALS`（サービスアカウントJSON。Apps Script API/Drive/Calendar権限）
  - `GAS_(AVAILABILITY|RESERVATION|REMINDER)_SCRIPT_ID_(DEV|PROD)`
  - `GAS_(AVAILABILITY|RESERVATION|REMINDER)_URL_(DEV|PROD)`（WebアプリURL）
  - `LINE_CHANNEL_TOKEN_(DEV|PROD)`
  - `CALENDAR_ID_(DEV|PROD)`
  - テナント別（例：`SAMPLE_STORE_LINE_CHANNEL_TOKEN_PROD` など）
- Vercel 環境変数
  - `apps/frontend`: `NEXT_PUBLIC_LIFF_ID`, `NEXT_PUBLIC_GAS_AVAILABILITY_URL`
  - `apps/admin`: `ADMIN_IP_ALLOWLIST`, `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASS`
- GAS「ウェブアプリとしてデプロイ」
  - 各 `apps/gas-*` を「全員」実行で公開（要件に応じ調整）し、発行URLを GitHub Secrets へ反映
- 管理画面の動作確認
  - `GET /api/health` が `{ ok: true }`
  - IP/BASIC 認証が期待どおり
  - テナント選択でステータス/デプロイ一覧が表示される

### 平常運用
- 設定変更：管理者ページから編集→PR作成→マージで反映
- デプロイ：管理者ページから手動実行 or pushで自動
- 監視：ヘルスページ、Actions結果、エラーログ（通知）

### 後でまとめて実施（初回構築時）
- GitHub Secrets 登録：
  - `GOOGLE_CREDENTIALS`（Service Account JSON）
  - `GAS_(RESERVATION|AVAILABILITY|REMINDER)_SCRIPT_ID_(DEV|PROD)`
  - `LINE_CHANNEL_TOKEN_(DEV|PROD)` / `CALENDAR_ID_(DEV|PROD)`
  - `GAS_ADMIN_TOKEN_(DEV|PROD)`
  - `GAS_(RESERVATION|AVAILABILITY|REMINDER)_URL_(DEV|PROD)`
- GAS 側 Script Properties 設定（CIの同期スクリプト導入後は自動反映）
- Vercel ENV 設定（LIFF ID / Availability URL）
- 管理者ページ ENV 設定：
  - `GITHUB_TOKEN_FOR_DISPATCH`（repo権限付きPAT）
  - `GITHUB_REPOSITORY`（`owner/repo` 形式）

### マルチテナント運用
- テナント追加：`packages/config/tenants/{tenantId}` を作成（menu/rules/ui/mapping）
- Secrets命名規約（例）：
  - `{TENANT}_LINE_CHANNEL_TOKEN_{DEV|PROD}`
  - `{TENANT}_CALENDAR_ID_{DEV|PROD}`
  - `{TENANT}_GAS_{APP}_SCRIPT_ID_{DEV|PROD}`, `{TENANT}_GAS_{APP}_URL_{DEV|PROD}`
  - `{TENANT}_LIFF_ID_{DEV|PROD}`, `{TENANT}_GAS_ADMIN_TOKEN_{DEV|PROD}`
- 管理UIから tenantId を指定してデプロイ/同期/LIFF更新

### トラブル対応
- フロント：Vercelの過去デプロイへロールバック
- GAS：直近安定版のデプロイIDへ切替（clasp deploy -i）
- 設定：直前コミットへ戻す


