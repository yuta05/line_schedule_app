# LINE予約フォーム管理システム (Next.js版)

LINE LIFFを活用した予約フォーム管理システムです。サービス管理者がテンプレートからフォームを作成し、店舗管理者がフォームを設定・管理し、顧客がLINE上で予約を行うことができます。

## 🌟 主な機能

### 🔧 サービス管理者機能
- **店舗管理**: 店舗の作成・編集・削除
- **テンプレート選択**: 5つのテンプレートから選択してフォーム作成
  - 基本テンプレート（シンプル）
  - スタンダードテンプレート（性別選択あり）
  - プレミアムテンプレート（サブメニュー対応）
  - コンプリートテンプレート（オプション機能あり）
  - アルティメットテンプレート（全機能搭載）
- **フォーム管理**: 全店舗のフォーム状況監視

### 📋 店舗管理者機能
- **フォーム基本情報設定**: 店舗名、フォーム名、LIFF ID、テーマカラーの設定
- **メニュー・カテゴリ管理**: メニューの追加・編集・削除、カテゴリの作成・管理
- **画像アップロード**: メニューに画像を添付（Dropbox統合）
- **性別フィルタリング**: 性別によるメニュー表示制御
- **営業時間設定**: 曜日別営業時間・定休日の設定
- **プレビュー機能**: 変更内容をリアルタイムで確認
- **フォーム公開管理**: アクティブ/非アクティブの切り替え

### 👥 顧客向け機能
- **モバイル最適化**: LINE内での使いやすいインターフェース
- **性別選択**: 設定に応じたメニューフィルタリング
- **メニュー選択**: 画像付きメニューから選択
- **サブメニュー**: 詳細オプション選択
- **予約日時選択**: カレンダーから日時を選択
- **顧客情報入力**: 名前、電話番号、要望等の入力
- **Google Apps Script連携**: 予約データの自動送信

## 🛠 技術スタック

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: JSON ファイル (開発用)
- **Image Hosting**: Dropbox API
- **Backend Integration**: Google Apps Script
- **Package Manager**: npm

## 📁 プロジェクト構成

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── forms/[formId]/     # フォーム個別API
│   │   └── stores/             # 店舗関連API
│   ├── admin/[storeId]/        # サービス管理者画面
│   ├── [storeId]/              # 店舗管理者画面
│   │   ├── admin/              # 店舗ダッシュボード
│   │   └── forms/[formId]/     # フォーム編集画面
│   └── form/[formId]/          # 顧客向けフォーム
├── components/                  # 再利用可能なコンポーネント
│   ├── Calendar/               # カレンダー関連
│   ├── FormEditor/             # フォーム編集コンポーネント
│   ├── FormRenderer/           # フォーム表示コンポーネント
│   └── Layout/                 # レイアウトコンポーネント
├── services/                   # ビジネスロジック・API
├── types/                      # TypeScript型定義
└── utils/                      # ユーティリティ関数
data/                           # データファイル (開発用)
├── stores.json                 # 店舗データ
├── forms.json                  # グローバルフォームデータ
└── forms_st*.json              # 店舗別フォームデータ
```

## 🚀 開発環境セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

#### 初回セットアップの方（Node.jsがまだインストールされていない場合）

**Node.jsのインストール:**
1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. LTS版（推奨版）をダウンロードしてインストール
3. インストール後、ターミナルで確認：
   ```bash
   node --version  # v18.0.0以上であることを確認
   npm --version   # npmも一緒にインストールされます
   ```

**Gitのインストール（必要な場合）:**
- [Git公式サイト](https://git-scm.com/)からダウンロード
- または、macOSの場合：`xcode-select --install`
- Windowsの場合：[Git for Windows](https://gitforwindows.org/)

**推奨エディタ:**
- [Visual Studio Code](https://code.visualstudio.com/) + 以下の拡張機能：
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd line_schedule_app/booking-forms
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.local.example .env.local
# .env.localファイルを編集して必要な環境変数を設定
```

4. **開発サーバーの起動**
```bash
npm run dev
```

5. **ブラウザでアクセス**
```
http://localhost:3000
```

### 利用可能なコマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLintによるコード検査
- `npm run type-check` - TypeScriptの型チェック

## 📖 使用方法

### サービス管理者画面
1. `/admin/{storeId}` でサービス管理画面にアクセス
2. 店舗管理で新規店舗を作成
3. テンプレート選択でフォームを作成：
   - **基本**: シンプルなメニュー選択
   - **スタンダード**: 性別選択機能付き
   - **プレミアム**: サブメニュー対応
   - **コンプリート**: オプション・来店回数選択
   - **アルティメット**: 全機能（クーポン・リピート予約）

### 店舗管理者画面
1. `/{storeId}/admin` で店舗ダッシュボードにアクセス
2. フォーム一覧で編集したいフォームを選択
3. 各タブで設定を行う：
   - **基本情報**: 店舗情報、テーマカラー設定
   - **メニュー**: カテゴリ・メニューの管理
   - **営業時間**: 営業時間、休業日設定
   - **オプション**: 性別選択、クーポン等の設定
4. プレビューで確認後、公開

### 顧客向けフォーム
1. `/form/{formId}` でフォームにアクセス
2. 設定に応じて以下を選択：
   - 性別選択（設定されている場合）
   - 来店回数選択（設定されている場合）
   - クーポン利用（設定されている場合）
3. メニュー選択（画像確認可能）
4. サブメニュー・オプション選択
5. 予約日時選択
6. 顧客情報入力
7. 予約確定（Google Apps Scriptに送信）

## 🔧 設定とカスタマイズ

### テンプレート機能
フォーム作成時に5つのテンプレートから選択可能：

| テンプレート | 機能 |
|------------|------|
| 基本 | シンプルなメニュー選択 |
| スタンダード | + 性別選択 |
| プレミアム | + サブメニュー |
| コンプリート | + オプション・来店回数 |
| アルティメット | + クーポン・リピート予約 |

### 画像アップロード
- 対応形式: PNG, JPEG, GIF, WebP (最大5MB)
- Dropbox API経由でアップロード
- 顧客フォームでポップアップ表示

### フォーム構造の互換性
- 新形式（簡易構造）と旧形式（config構造）の両方に対応
- APIレベルで自動正規化

## 🏗 アーキテクチャ

### データフロー
1. **サービス管理者** → テンプレート選択 → フォーム作成
2. **店舗管理者** → フォーム編集 → 設定保存
3. **顧客** → フォーム入力 → GAS送信 → 予約完了

### API設計
- `/api/stores` - 店舗管理
- `/api/stores/{storeId}/forms` - 店舗別フォーム管理
- `/api/forms/{formId}` - フォーム個別操作
- RESTful設計でCRUD操作対応

## 🚀 デプロイメント

### プロダクションビルド
```bash
npm run build
npm run start
```

### 環境変数
`.env.local`ファイルで以下の設定：
```
# Dropbox API設定
DROPBOX_ACCESS_TOKEN=your_dropbox_token

# その他の設定
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### デプロイ先候補
- **Vercel**: Next.jsに最適化（推奨）
- **Netlify**: 静的サイトホスティング
- **AWS Amplify**: フルスタック対応

## 🤝 開発ガイド

### 新機能の追加
1. `src/types/form.ts` で型定義を追加
2. APIルートを `src/app/api/` に実装
3. UIコンポーネントを作成
4. テンプレート機能に統合

### コード規約
- TypeScriptの厳格モード使用
- ESLint + Prettier でコード品質維持
- Next.js App Routerの規約に従う
- Tailwind CSSでスタイリング

### デバッグ
- フォーム構造の互換性問題 → API正規化を確認
- 画像アップロード問題 → Dropbox API設定を確認
- GAS連携問題 → エンドポイントURL設定を確認

