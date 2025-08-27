## 仕様書（MVP, multi-tenant）

### 1) 予約フォーム（Next.js, LIFF）
- LIFF初期化：`liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })`
- 空き取得：`GET {GAS_AVAILABILITY_URL}?startTime&endTime`
- 所要時間：来店回数補正 + メニュー + オプション → 終了時刻判定（`rules.lastAcceptableEnd`以内）
- 送信：`liff.sendMessages()` で既存テンプレ文面を投稿
- 入力補助：氏名/電話/来店回数を localStorage 復元

### 2) 管理者ページ（弊社用, マルチテナント）
- 顧客（テナント）管理：一覧/検索/詳細、`packages/config/tenants/{tenantId}` 参照
- 設定編集（非機密）：テナント別 `menu.json`, `rules.json`, `ui.json` をPR化
- 機密の更新：テナント別の Secrets/Script Properties を同期（adminToken保護エンドポイント）
- デプロイ：テナント別に `workflow_dispatch(app, environment, tenant)` を起動
- LIFF エンドポイント更新：テナント別 LIFF ID / URL を更新
- 状態：テナントごとのデプロイ履歴、GAS URL、トリガー、ヘルス

### 3) GAS（3サービス）
- reservation：LINE Webhook→予約/確認/キャンセル、場所=LINE userId、24h前キャンセル不可
- availability：期間のイベントJSON返却、営業日優先
- reminder：毎日19:00、翌日分をuserId宛に送信
（全てTS化、claspでpush→version→deploy、Script Properties同期）

### 設定スキーマ
- `menu.json`：メニュー/オプション/所要時間/来店回数補正
- `rules.json`：営業時間（曜日別）、定休日、最終受付、同時受付数、最大予約期間
- `ui.json`：文言/注意/同意


