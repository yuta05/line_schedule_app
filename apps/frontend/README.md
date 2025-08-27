## apps/frontend (Next.js + LIFF)

予約フォーム。既存 `予約フォーム.html` を Next.js へ移植します。

### 環境変数（Vercel）
- `NEXT_PUBLIC_LIFF_ID`
- `NEXT_PUBLIC_GAS_AVAILABILITY_URL`

### 主要機能
- LIFF初期化、空き状況取得、所要時間計算、`liff.sendMessages()` 送信
- UI文言やメニュー/営業時間は `packages/config/{env}` を参照

### 開発
```
npm i
npm run dev
```

環境変数（ローカル）
- `NEXT_PUBLIC_LIFF_ID`（未設定でも起動可）
- `NEXT_PUBLIC_GAS_AVAILABILITY_URL`（未設定時は`/api/availability`のモックを使用）

.env.local 例:
```
NEXT_PUBLIC_LIFF_ID=
NEXT_PUBLIC_GAS_AVAILABILITY_URL=
```

### 既存HTMLからの移植ポイント
- LIFF ID 設定箇所（旧: 約991行）→ `.env` で注入
- 空き取得GAS URL（旧: 約1562行）→ `.env`/config から参照


