## apps/gas-reservation（予約/確認/キャンセル）

LINE Webhook を受け、Googleカレンダーに予約を作成/照会/削除します。

### 技術
- TypeScript + clasp
- Script Properties：`CHANNEL_ACCESS_TOKEN`, `CALENDAR_ID`, ほか

### デプロイ（CI）
- `clasp push` → `clasp version` → `clasp deploy`
- プロパティ同期は Actions から Apps Script API で更新


