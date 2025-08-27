## wakuwaku_NAKAE-Reservation (Next.js + GAS, managed by our admin)

このリポジトリは、LINE公式アカウント向けの予約サービスを弊社で運用・管理するためのモノレポです。顧客（導入店舗）にはフォームURLとLIFFを提供し、設定やデプロイは弊社の管理者が行います。

### 構成（モノレポ）
```
apps/
  frontend/         # 予約フォーム（Next.js, LIFF）
  admin/            # 弊社用 管理者ページ（Next.js）
  gas-reservation/  # GAS: 予約/確認/キャンセル（LINE Webhook）
  gas-availability/ # GAS: 空き状況API
  gas-reminder/     # GAS: 前日リマインド（時間トリガー）
packages/
  config/           # 非機密設定（環境別JSON）
  shared/           # 共通ロジック/型
.github/workflows/  # CI/CD（Vercel/GAS/LIFF連携）
docs/               # ドキュメント（仕様/運用/チェックリスト）
```

### ドキュメント
- docs/00_overview.md（概要）
- docs/10_plan.md（進め方）
- docs/20_specs.md（仕様）
- docs/30_operations.md（運用）
- docs/40_checklists.md（チェックリスト）
- docs/50_migration_from_legacy.md（移行）
- docs/60_liff_automation.md（LIFF自動化）
- docs/61_gas_cicd.md（GAS CI/CD）
- docs/62_secrets_matrix.md（Secrets/Env）
- docs/63_admin_api_design.md（管理API設計）
- docs/90_progress_log.md（進捗ログ）

### 環境と役割
- 管理者（弊社）: 設定変更、デプロイ、監視、サポート
- 顧客（店舗）: 公式LINEからLIFFで予約フォームを利用（設定・デプロイは弊社が代行）

### 進め方（初期）
1. モノレポの雛形作成（本README、docs、packages/config）
2. 既存 `予約フォーム.html` を Next.js へ移植（apps/frontend）
3. GAS 3種を TypeScript 化＋clasp 導入（apps/gas-*）
4. CI/CD スタブ追加（Vercel/GAS）
5. 管理者ページ MVP（設定編集/デプロイ実行/状態表示）

詳細は `docs/` を参照してください。


