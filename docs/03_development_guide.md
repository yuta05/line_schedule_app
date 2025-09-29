# LINE予約フォーム管理システム 開発ガイド

## 🎯 プロジェクト概要

このプロジェクトは、LINE LIFFを活用したマルチテナント予約フォーム管理システムです。

### ハイブリッド構成（推奨）
- **管理システム**: Next.js 15 + Supabase（動的）
- **フォーム配信**: Vercel 静的サイト（HTML/JS）
- **自動化**: Vercel API による自動デプロイ
- **外部連携**: LINE LIFF, Google Apps Script

### 従来構成（開発・テスト用）
- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **バックエンド**: Next.js API Routes + JSON ファイル
- **デプロイ**: Vercel
- **認証**: 基本認証（今後Supabase Auth）

## 🛠 開発環境セットアップ

### 前提条件
- Node.js 18.0+
- npm または yarn
- Git
- Docker (Supabase Local用)

### 初期セットアップ手順

#### 1. プロジェクト作成
```bash
# Next.js プロジェクト作成
npx create-next-app@latest booking-forms --typescript --tailwind --eslint --app --src-dir
cd booking-forms

# 必要なパッケージインストール
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand swr zod
npm install -D @types/node prisma
```

#### 2. Supabase セットアップ
```bash
# Supabase CLI インストール
npm install -g supabase

# Supabase プロジェクト初期化
supabase init

# ローカル Supabase 起動
supabase start

# 環境変数設定
cp .env.local.example .env.local
```

#### 3. 環境変数設定
```bash
# .env.local (開発用)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# .env.production (本番用)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

#### 4. データベースセットアップ
```bash
# マイグレーション実行
supabase db reset

# シードデータ投入
supabase db seed

# 開発サーバー起動
npm run dev
# http://localhost:3000 でアクセス
```

### 開発環境オプション

#### Option A: Supabase Local（推奨）
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Supabase Local起動
supabase start
npm run dev
```

#### Option B: Supabase Cloud（開発用プロジェクト）
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

npm run dev
```

#### Option C: JSON Server（軽量プロトタイピング）
```bash
# JSONファイルでのモックAPI
npm install -g json-server
# db.json作成後
json-server --watch db.json --port 3001
npm run dev
```

## 📁 プロジェクト構造

```
booking-forms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # ホームページ
│   │   ├── admin/             # サービス管理者画面
│   │   │   ├── page.tsx       # 店舗一覧
│   │   │   └── [storeId]/     # 個別店舗管理
│   │   ├── [storeId]/         # 店舗管理画面
│   │   │   ├── admin/         # フォーム一覧
│   │   │   └── forms/[formId] # フォーム編集
│   │   ├── form/[formId]/     # 顧客フォーム（動的版）
│   │   └── api/               # API Routes
│   │       ├── stores/        # 店舗管理API
│   │       └── forms/         # フォーム管理API
│   ├── components/            # 共通コンポーネント
│   │   ├── FormEditor/       # フォーム編集関連
│   │   │   ├── BasicInfoEditor.tsx
│   │   │   ├── MenuStructureEditor.tsx
│   │   │   └── BusinessRulesEditor.tsx
│   │   └── ui/               # UIコンポーネント
│   ├── lib/                  # ユーティリティ関数
│   │   ├── memory-storage.ts # 開発用JSONストレージ
│   │   ├── static-generator.ts # 静的HTML生成（予定）
│   │   └── vercel-deployer.ts # Vercel自動デプロイ（予定）
│   └── types/                # TypeScript 型定義
│       ├── form.ts           # フォーム関連型
│       └── store.ts          # 店舗関連型
├── data/                     # 開発用データファイル
│   ├── forms.json           # フォームデータ
│   └── stores.json          # 店舗データ
├── supabase/                 # Supabase 設定（将来用）
│   ├── config.toml          
│   ├── migrations/          
│   └── seed.sql             
└── public/                  # 静的ファイル
```

## 🔄 現在の実装状況

### ✅ 完成済み機能
- **店舗管理**: 作成・編集・一覧表示
- **フォーム管理**: 作成・編集・設定保存
- **メニュー構成**: カテゴリ・メニュー・オプション管理
- **顧客フォーム**: 動的フォーム表示・予約機能
- **設定機能**: 性別選択・来店回数・クーポン等
- **プレビュー**: 管理画面からの確認機能

### 🚧 開発中・予定機能
- **静的HTML生成**: React → バニラJS変換
- **Vercel自動デプロイ**: API連携による自動化
- **認証システム**: Supabase Auth統合
- **データベース**: JSONファイル → Supabase移行
- **外部API**: Google Calendar・LINE LIFF連携

## 🔧 Supabase + Next.js実装

### Supabase Client設定
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server Component用 (Cookie使用)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};
```

### 開発時のデータ管理戦略
```typescript
// lib/data-manager.ts - 開発段階での柔軟なデータ管理
export class DataManager {
  // 開発環境では Supabase Local または JSON を使用
  static async getStores() {
    if (process.env.NODE_ENV === 'development') {
      // Supabase Local使用
      return supabase.from('stores').select('*');
    }
    // 本番では通常のSupabase
    return supabase.from('stores').select('*');
  }

  // プロトタイピング用のモックデータ生成
  static generateMockStores(count: number = 10) {
    return Array.from({ length: count }, (_, i) => ({
      id: `st${(i + 1).toString().padStart(4, '0')}`,
      name: `店舗${i + 1}`,
      owner_name: `オーナー${i + 1}`,
      owner_email: `owner${i + 1}@example.com`,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
}
```

### API Routes実装
```typescript
// app/api/stores/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: stores, error } = await supabase
    .from('stores')
    .select(`
      *,
      forms (
        id,
        config,
        status,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(stores);
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const body = await request.json();
  const { name, owner_name, owner_email } = body;

  // 店舗ID生成（st0001形式）
  const { data: existingStores } = await supabase
    .from('stores')
    .select('id')
    .like('id', 'st%')
    .order('id', { ascending: false })
    .limit(1);

  let newStoreId = 'st0001';
  if (existingStores && existingStores.length > 0) {
    const lastId = existingStores[0].id;
    const lastNumber = parseInt(lastId.replace('st', '')) || 0;
    newStoreId = `st${(lastNumber + 1).toString().padStart(4, '0')}`;
  }

  const { data: store, error } = await supabase
    .from('stores')
    .insert({
      id: newStoreId,
      name,
      owner_name,
      owner_email,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(store, { status: 201 });
}

// 開発用: モックデータ生成エンドポイント
export async function PUT() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // モックデータ生成
  const mockStores = Array.from({ length: 5 }, (_, i) => ({
    id: `st${(i + 1).toString().padStart(4, '0')}`,
    name: `サンプル店舗${i + 1}`,
    owner_name: `オーナー${i + 1}`,
    owner_email: `owner${i + 1}@example.com`,
    status: 'active'
  }));

  const { data, error } = await supabase
    .from('stores')
    .upsert(mockStores)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Mock data created', data });
}
```

### カスタムHooks実装
```typescript
// hooks/use-stores.ts
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export function useStores() {
  const { data, error, mutate } = useSWR('/api/stores', fetcher);

  const createStore = async (storeData: {
    name: string;
    owner_name: string;
    owner_email: string;
  }) => {
    const response = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData),
    });

    if (!response.ok) throw new Error('Failed to create store');
    
    mutate(); // データ再取得
    return response.json();
  };

  // 開発用: モックデータ生成
  const generateMockData = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const response = await fetch('/api/stores', {
      method: 'PUT', // 開発用エンドポイント
    });
    
    if (response.ok) {
      mutate(); // データ再取得
    }
  };

  return {
    stores: data || [],
    isLoading: !error && !data,
    isError: error,
    createStore,
    generateMockData,
    refresh: mutate,
  };
}

// hooks/use-auth.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // 開発用: 簡易認証（本番では削除）
  const devSignIn = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // 開発用の固定ユーザーでサインイン
    const { error } = await supabase.auth.signInWithPassword({
      email: 'dev@example.com',
      password: 'devpassword',
    });
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    devSignIn,
  };
}

// hooks/use-dev-tools.ts - 開発用ツール
export function useDevTools() {
  const [isDevMode, setIsDevMode] = useState(
    process.env.NODE_ENV === 'development'
  );

  const resetDatabase = async () => {
    if (!isDevMode) return;
    
    // 開発環境でのリセット処理
    console.log('Database reset (development only)');
  };

  const seedData = async () => {
    if (!isDevMode) return;
    
    // サンプルデータ投入
    await fetch('/api/stores', { method: 'PUT' });
    console.log('Sample data seeded');
  };

  return {
    isDevMode,
    resetDatabase,
    seedData,
  };
}
```

## 🗄 データベースセットアップ

### Supabase マイグレーション
```sql
-- supabase/migrations/001_create_tables.sql

-- Stores table
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  description TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  draft_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  draft_status TEXT DEFAULT 'none' CHECK (draft_status IN ('none', 'editing', 'ready')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_published_at TIMESTAMPTZ
);

-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  selected_menus JSONB DEFAULT '[]',
  selected_options JSONB DEFAULT '{}',
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  customer_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table (for Supabase Storage references)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_forms_store_id ON forms(store_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_reservations_form_id ON reservations(form_id);
CREATE INDEX idx_reservations_store_id ON reservations(store_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security設定
```sql
-- supabase/migrations/002_rls_policies.sql

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Service admins can do everything on stores" ON stores
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_admin');

CREATE POLICY "Store admins can view own store" ON stores
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'store_admin' AND 
    auth.jwt() ->> 'store_id' = id
  );

-- Forms policies
CREATE POLICY "Service admins can do everything on forms" ON forms
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_admin');

CREATE POLICY "Store admins can manage own forms" ON forms
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'store_admin' AND 
    auth.jwt() ->> 'store_id' = store_id
  );

CREATE POLICY "Public can view published forms" ON forms
  FOR SELECT USING (status = 'published');

-- Reservations policies
CREATE POLICY "Service admins can do everything on reservations" ON reservations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_admin');

CREATE POLICY "Store admins can manage own reservations" ON reservations
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'store_admin' AND 
    auth.jwt() ->> 'store_id' = store_id
  );

CREATE POLICY "Customers can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);
```

### シードデータ
```sql
-- supabase/seed.sql

-- サンプル店舗データ
INSERT INTO stores (id, name, owner_name, owner_email, phone, address) VALUES
('st0001', '美容室 HAIR STUDIO A', '田中太郎', 'tanaka@example.com', '03-1234-5678', '東京都渋谷区1-1-1'),
('st0002', 'ネイルサロン NAIL ART B', '佐藤花子', 'sato@example.com', '03-2345-6789', '東京都新宿区2-2-2'),
('st0003', 'マッサージ RELAX SPA C', '鈴木次郎', 'suzuki@example.com', '03-3456-7890', '東京都品川区3-3-3');

-- サンプルフォームデータ
INSERT INTO forms (store_id, config, status) VALUES
('st0001', '{"basic_info":{"form_name":"ヘアカット予約","store_name":"美容室 HAIR STUDIO A"},"menu_structure":{"categories":[{"name":"カット","menus":[{"name":"カット","price":3000}]}]}}', 'published'),
('st0002', '{"basic_info":{"form_name":"ネイル予約","store_name":"ネイルサロン NAIL ART B"},"menu_structure":{"categories":[{"name":"ネイル","menus":[{"name":"ジェルネイル","price":5000}]}]}}', 'draft'),
('st0003', '{"basic_info":{"form_name":"マッサージ予約","store_name":"マッサージ RELAX SPA C"},"menu_structure":{"categories":[{"name":"マッサージ","menus":[{"name":"全身マッサージ","price":8000}]}]}}', 'published');
```

### package.json スクリプト
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:seed": "supabase db seed",
    "supabase:types": "supabase gen types typescript --local > src/types/database.ts",
    
    "db:migrate": "supabase migration new",
    "db:push": "supabase db push",
    "db:pull": "supabase db pull",
    
    "dev:setup": "npm run supabase:start && npm run supabase:reset && npm run dev",
    "dev:clean": "npm run supabase:stop && npm run supabase:start && npm run supabase:reset"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "swr": "^2.2.4",
    "zustand": "^4.4.7",
    "zod": "^3.22.4",
    "tailwindcss": "^3.3.6",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/node": "20.8.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "typescript": "5.2.0",
    "eslint": "8.51.0",
    "eslint-config-next": "14.0.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "playwright": "^1.39.0",
    "json-server": "^0.17.4"
  }
}
```

## 🧪 テスト戦略

### テスト構成
```
src/
├── __tests__/              # Unit Tests
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── api/
├── __integration__/        # Integration Tests
│   ├── auth/
│   └── database/
└── __e2e__/               # E2E Tests
    ├── admin/
    ├── customer/
    └── fixtures/
```

### API Route テストサンプル
```typescript
// __tests__/api/stores.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/stores/route';

// Supabase モック
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            { id: 'st0001', name: 'Test Store', owner_name: 'Test Owner' }
          ],
          error: null
        }))
      }))
    }))
  }))
}));

describe('/api/stores', () => {
  test('GET should return stores list', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('st0001');
  });

  test('POST should create new store', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'New Store',
        owner_name: 'New Owner',
        owner_email: 'new@example.com'
      }
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
  });
});
```

### React Hook テストサンプル
```typescript
// __tests__/hooks/use-stores.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useStores } from '@/hooks/use-stores';

// SWR モック
jest.mock('swr');

describe('useStores', () => {
  test('should return stores data', async () => {
    const mockData = [
      { id: 'st0001', name: 'Test Store' }
    ];

    require('swr').default.mockReturnValue({
      data: mockData,
      error: null,
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useStores());

    await waitFor(() => {
      expect(result.current.stores).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

## 🔄 Git ワークフロー

### ブランチ戦略
```
main                # 本番環境
├── develop         # 開発統合ブランチ
├── feature/*       # 機能開発ブランチ
├── bugfix/*        # バグ修正ブランチ
└── hotfix/*        # 緊急修正ブランチ
```

### コミット規約
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更

例:
feat: FormID生成をランダム文字列に変更
fix: 店舗管理画面の表示エラー修正
docs: Repository パターンの設計ドキュメント追加
```

## 📋 開発タスクリスト

### Phase 1: Repository パターン実装
- [ ] インターフェース定義
- [ ] LocalStorage Repository 実装
- [ ] DynamoDB Repository 実装
- [ ] Repository Factory 実装
- [ ] DataService 統合
- [ ] 既存コンポーネントの移行
- [ ] テスト実装

### Phase 2: AWS インフラ構築
- [ ] Terraform 設定
- [ ] DynamoDB テーブル設計
- [ ] Lambda Functions 実装
- [ ] API Gateway 設定
- [ ] Cognito 設定
- [ ] S3 + CloudFront 設定

### Phase 3: CI/CD パイプライン
- [ ] GitHub Actions 設定
- [ ] テスト自動化
- [ ] デプロイメント自動化
- [ ] 監視・アラート設定

## 🚀 デプロイメント

### Vercel デプロイ
```bash
# Vercel CLI インストール
npm install -g vercel

# 初回デプロイ
vercel

# 本番デプロイ
vercel --prod

# 環境変数設定
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Supabase 本番環境構築
```bash
# Supabase プロジェクト作成（Web UI）
# https://supabase.com/dashboard

# 本番環境へのマイグレーション
supabase link --project-ref your-project-ref
supabase db push

# 本番環境へのシードデータ投入
supabase db seed --db-url your-production-db-url
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint

  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔍 デバッグとトラブルシューティング

### よくある問題

#### 1. Supabase Local 接続エラー
```bash
# Supabase ステータス確認
supabase status

# Supabase 再起動
supabase stop
supabase start

# データベースリセット
supabase db reset
```

#### 2. 認証エラー
```typescript
// JWT デバッグ
console.log('User:', user);
console.log('Session:', session);

// RLS ポリシー確認
const { data, error } = await supabase
  .from('stores')
  .select('*');
console.log('Data:', data, 'Error:', error);
```

#### 3. Next.js ビルドエラー
```bash
# 型チェック
npm run type-check

# キャッシュクリア
rm -rf .next
npm run build
```

#### 4. Vercel デプロイエラー
```bash
# ローカルでVercelビルド確認
vercel build

# 環境変数確認
vercel env ls
```

## 🔍 デバッグとトラブルシューティング

### よくある問題

#### 1. Supabase Local 接続エラー
```bash
# Supabase コンテナ確認
supabase status

# Supabase Local 再起動
supabase stop
supabase start

# ポート確認
lsof -i :54321  # Supabase Local API
lsof -i :54322  # PostgreSQL
```

#### 2. 環境変数が読み込まれない
```typescript
// 環境変数確認
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Environment:', process.env.NODE_ENV);

// .env.local ファイル確認
// NEXT_PUBLIC_ プレフィックスが必要
```

#### 3. 型エラー・データベース型不一致
```bash
# Supabase型生成
npm run supabase:types

# 型チェック
npm run type-check

# マイグレーション確認
supabase db diff
```

#### 4. 開発データリセット
```bash
# 完全リセット
npm run dev:clean

# データベースのみリセット
npm run supabase:reset

# シードデータ再投入
npm run supabase:seed
```

### 開発効率化ツール

#### 開発用コンポーネント
```typescript
// components/dev/DevPanel.tsx - 開発環境でのみ表示
'use client';

import { useDevTools } from '@/hooks/use-dev-tools';

export function DevPanel() {
  const { isDevMode, resetDatabase, seedData } = useDevTools();

  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-bold mb-2">🛠 Dev Tools</h3>
      <div className="space-y-2">
        <button
          onClick={seedData}
          className="block w-full text-left text-sm hover:bg-gray-700 p-1 rounded"
        >
          📦 Generate Sample Data
        </button>
        <button
          onClick={resetDatabase}
          className="block w-full text-left text-sm hover:bg-gray-700 p-1 rounded text-red-300"
        >
          🗑 Reset Database
        </button>
        <a
          href="http://localhost:54323"
          target="_blank"
          className="block w-full text-left text-sm hover:bg-gray-700 p-1 rounded text-blue-300"
        >
          🔍 Supabase Studio
        </a>
      </div>
    </div>
  );
}

// app/layout.tsx に追加
import { DevPanel } from '@/components/dev/DevPanel';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DevPanel />
      </body>
    </html>
  );
}
```

この開発ガイドにより、DynamoDBを使わずに Supabase中心の統一された開発体験を提供できます。開発段階から本番まで一貫したデータベース体験で、学習コストを最小化し開発効率を最大化できます。
