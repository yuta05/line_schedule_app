## apps/gas-availability（空き状況API）

`GET /exec?startTime&endTime` で期間内のイベントをJSON返却。予約フォームが参照します。

### 仕様
- 営業日イベント（"営業日"）を優先。無ければ既定営業時間
- JST基準。エラー時は `{ error: string }`

### 開発
- `src/Code.ts`（TypeScript）
- `appsscript.json`（V8, JST）
- Script Properties：`CALENDAR_ID`



