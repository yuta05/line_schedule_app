## チェックリスト

### 初期セットアップ（テナント）Runbook
1) LINE Developers（弊社作業）
   - チャネル作成 → LIFF作成（TYPE: full）
   - `LIFF_ID` と `CHANNEL_ACCESS_TOKEN` を控える
2) Google Apps Script（弊社作業）
   - 3つのスクリプト（reservation/availability/reminder）を作成し `scriptId` を控える
   - ウェブアプリとしてデプロイ → 発行URLを控える（dev/prod）
   - サービスアカウント（`GOOGLE_CREDENTIALS`）に編集権限付与
3) GitHub Secrets（弊社作業）
   - 共通: `GOOGLE_CREDENTIALS`
   - テナント別: `{TENANT}_LINE_CHANNEL_TOKEN_{DEV|PROD}` / `{TENANT}_CALENDAR_ID_{DEV|PROD}`
   - GAS: `{TENANT}_GAS_{APP}_SCRIPT_ID_{DEV|PROD}` / `{TENANT}_GAS_{APP}_URL_{DEV|PROD}` / `{TENANT}_GAS_ADMIN_TOKEN_{DEV|PROD}`
4) Vercel 環境変数（弊社作業）
   - frontend: `NEXT_PUBLIC_LIFF_ID`, `NEXT_PUBLIC_GAS_AVAILABILITY_URL`
   - admin: `ADMIN_IP_ALLOWLIST`, `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASS`
5) 管理者ページで初回同期（弊社作業）
   - テナント選択 → GAS Deploy（dev）→ Properties同期が成功すること
   - LIFF更新（dev）→ フロントのURLへ切り替わること
6) 受け入れ確認（弊社/顧客）
   - 予約フォーム起動 → メニュー選択 → カレンダー表示 → 送信
   - LINEトークでメッセージ受信

### 初回
- [ ] LINE: チャネル作成、LIFF作成、`LIFF_ID`/`CHANNEL_ACCESS_TOKEN`取得
- [ ] Vercel: プロジェクト作成、ENV投入
- [ ] GAS: 3スクリプト作成、`scriptId`控え、サービスアカウント権限
- [ ] GitHub: Secrets登録（LINE/GAS/Vercel/Calendar）
- [ ] テナント追加：`packages/config/tenants/{tenantId}` を作成し mapping/menu/rules/ui を配置

### 本番前E2E
- [ ] 予約→確認→キャンセルがLINE上で動作
- [ ] カレンダー作成/削除を確認
- [ ] 翌日リマインドが送信
- [ ] リッチメニューからLIFF起動

### ロールバック
- [ ] Vercel過去デプロイへ切替手順理解
- [ ] GAS 過去デプロイIDへ切替手順確認
- [ ] 設定の前コミット復元手順確認


