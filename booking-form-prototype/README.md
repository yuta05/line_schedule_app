# LINE予約フォーム管理システム

LINE LIFFを活用した予約フォーム管理システムです。店舗管理者がフォームを設定・管理し、顧客がLINE上で予約を行うことができます。また本サービス管理者側で、予約フォームの追加、停止などを行えます。

## 🌟 主な機能

### 📋 管理機能
- **フォーム基本情報設定**: 店舗名、フォーム名、LIFF ID、テーマカラーの設定
- **メニュー・カテゴリ管理**: メニューの追加・編集・削除、カテゴリの作成・管理
- **画像アップロード**: メニューに画像を添付、顧客向けフォームでポップアップ表示
- **性別フィルタリング**: 性別によるメニュー表示制御
- **ドラフト・公開ワークフロー**: 変更をドラフトとして保存し、プレビュー後に公開
- **来店オプション設定**: 来店時間や追加サービスの管理

### 👥 顧客向け機能
- **モバイル最適化**: LINE内での使いやすいインターフェース
- **性別選択**: 設定に応じたメニューフィルタリング
- **メニュー選択**: 画像付きメニューから選択
- **予約日時選択**: カレンダーから日時を選択
- **顧客情報入力**: 名前、電話番号、要望等の入力

## 🛠 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router
- **Data Storage**: LocalStorage (プロトタイプ版)
- **File Handling**: Base64エンコーディング
- **Testing**: Jest + React Testing Library

## 📁 プロジェクト構成

```
src/
├── components/           # 再利用可能なコンポーネント
│   ├── Calendar/        # カレンダー関連
│   └── FormManagement/  # フォーム管理コンポーネント
├── pages/               # ページコンポーネント
├── services/            # ビジネスロジック・API
├── types/               # TypeScript型定義
├── hooks/               # カスタムフック
└── utils/               # ユーティリティ関数
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
  - React/Redux Extension Pack
  - Prettier - Code formatter

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd line_schedule_app/booking-form-prototype
```

2. **依存関係のインストール**
```bash
npm install
```

3. **開発サーバーの起動**
```bash
npm run dev
```

4. **ブラウザでアクセス**
```
http://localhost:5173
```

### 利用可能なコマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run test` - テスト実行
- `npm run lint` - ESLintによるコード検査
- `npm run type-check` - TypeScriptの型チェック

## 📖 使用方法

### 管理者画面
1. ダッシュボード (`/dashboard`) でフォーム一覧を確認
2. 新規フォーム作成または既存フォーム編集
3. 各タブで設定を行う：
   - **基本情報**: 店舗情報、性別選択設定
   - **メニュー構成**: カテゴリ・メニューの管理
   - **ビジネスルール**: 営業時間、休業日設定
4. プレビューで確認後、公開

### 顧客向けフォーム
1. LINE LIFF経由でアクセス (`/form/{formId}`)
2. 性別選択（設定されている場合）
3. 来店オプション選択
4. メニュー選択（画像確認可能）
5. 予約日時選択
6. 顧客情報入力
7. 予約確定

## 🔧 設定とカスタマイズ

### テーマカラー
フォームのテーマカラーは管理画面で設定可能です。プリセットカラーまたはカスタムカラーを選択できます。

### 性別フィルタリング
基本情報設定で性別選択を有効にすると、メニューカテゴリごとに表示対象の性別を設定できます。

### 画像アップロード
対応形式: PNG, JPEG, GIF, WebP, PDF (最大5MB)

## 🧪 テスト

```bash
# 全テスト実行
npm run test

# 監視モードでテスト実行
npm run test:watch

# カバレッジ付きテスト実行
npm run test:coverage
```

## 📚 開発ガイド

### 新機能の追加
1. `src/types/form.ts` で必要な型定義を追加
2. `src/services/` で関連サービスを実装
3. `src/components/` でUIコンポーネントを作成
4. テストケースを追加

### コード規約
- TypeScriptの厳格モードを使用
- ESLint + Prettierでコード品質を維持
- Material-UIのデザインシステムに従う
- コンポーネントは関数型で実装

## 🚀 デプロイメント

### プロダクションビルド
```bash
npm run build
```

### 環境変数
`.env`ファイルで以下の設定が可能です：
```
VITE_APP_TITLE=LINE予約フォーム
VITE_API_BASE_URL=https://api.example.com
```


