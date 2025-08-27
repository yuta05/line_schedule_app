## 既存HTML/GASからの移行ガイド

### 予約フォーム.html → Next.js
- LIFF ID（旧: 約991行）→ `.env` で `NEXT_PUBLIC_LIFF_ID`
- 空き取得GAS URL（旧: 約1562行）→ `.env`/`packages/config` へ外出し
- 文言・メニュー・営業時間 → `packages/config/{env}` に定義

### GAS テキスト → TypeScript + clasp
- `GAS_予約システム.txt` → `apps/gas-reservation/src/*.ts`
- `GAS_Googleカレンダーイベント取得.txt` → `apps/gas-availability/src/*.ts`
- `GAS_リマインドメッセージ.txt` → `apps/gas-reminder/src/*.ts`
- `Script Properties`：`CHANNEL_ACCESS_TOKEN`, `CALENDAR_ID` などをCIから同期

### 動作確認
1) dev環境でフォーム起動→予約→確認→キャンセル
2) カレンダー反映/削除、翌日リマインドの送信
3) 本番へ切替、LIFF URLをリッチメニューへ登録


