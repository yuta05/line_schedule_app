# LINE予約フォーム管理システム 技術設計書

## 🏗 システムアーキテクチャ概要

### 全体構成図（Next.js + Supabase）
```mermaid
graph TB
    subgraph "Client Layer"
        CU[顧客<br/>LINE Browser]
        SA[サービス管理者<br/>Web Browser]
        STO[店舗管理者<br/>Web Browser]
    end

    subgraph "Vercel Platform"
        VERCEL[Vercel<br/>CDN + Edge Functions]
        NEXTJS[Next.js App<br/>React + TypeScript]
        API[API Routes<br/>Serverless Functions]
    end

    subgraph "Supabase Platform"
        POSTGRES[PostgreSQL<br/>Database]
        AUTH[Supabase Auth<br/>Authentication]
        STORAGE[Supabase Storage<br/>File Storage]
        REALTIME[Realtime<br/>Live Updates]
    end

    subgraph "External Services"
        GCL[Google Calendar API]
        LINE[LINE Messaging API]
    end

    CU --> VERCEL
    SA --> VERCEL
    STO --> VERCEL
    VERCEL --> NEXTJS
    NEXTJS --> API
    API --> POSTGRES
    API --> AUTH
    API --> STORAGE
    API --> REALTIME
    API --> GCL
    API --> LINE
```

## 🌐 フロントエンド設計

### Next.js App Router 構成
```mermaid
graph TB
    subgraph "Next.js App"
        APP[app/layout.tsx<br/>Root Layout]
        
        subgraph "Service Admin"
            SADMIN[app/admin/page.tsx<br/>店舗一覧・管理]
            STOADMIN[app/admin/[storeId]/page.tsx<br/>個別店舗管理]
        end
        
        subgraph "Store Admin"
            DASH[app/[storeId]/admin/page.tsx<br/>フォーム一覧]
            FMGMT[app/[storeId]/forms/[formId]/page.tsx<br/>フォーム編集]
            FPREV[app/[storeId]/forms/[formId]/preview/page.tsx<br/>プレビュー]
        end
        
        subgraph "Customer"
            CFORM[app/form/[formId]/page.tsx<br/>予約フォーム]
        end
        
        subgraph "API Routes"
            STOREAPI[app/api/stores/route.ts]
            FORMAPI[app/api/forms/route.ts]
            AUTHAPI[app/api/auth/route.ts]
        end
        
        subgraph "Shared Components"
            LAYOUT[components/Layout]
            FCOMP[components/Form]
            UI[components/UI]
        end
    end

    APP --> SADMIN
    APP --> STOADMIN
    APP --> DASH
    APP --> FMGMT
    APP --> FPREV
    APP --> CFORM
    
    SADMIN --> STOREAPI
    DASH --> FORMAPI
    FMGMT --> FORMAPI
    CFORM --> FORMAPI
```

### URL設計
```mermaid
graph LR
    subgraph "URL Structure"
        ROOT["/"]
        
        subgraph "Service Admin"
            ADMIN["/admin"]
            ADMINSTORE["/admin/{storeId}"]
        end
        
        subgraph "Store Admin"
            STOREADMIN["/{storeId}/admin"]
            STOREFORM["/{storeId}/forms/{formId}"]
            STOREPREVIEW["/{storeId}/forms/{formId}/preview"]
        end
        
        subgraph "Customer"
            CUSTFORM["/form/{formId}"]
        end
    end

    ROOT --> ADMIN
    ADMIN --> ADMINSTORE
    ROOT --> STOREADMIN
    STOREADMIN --> STOREFORM
    STOREFORM --> STOREPREVIEW
    ROOT --> CUSTFORM
    
    classDef example fill:#e1f5fe
    ADMINSTORE:::example
    STOREADMIN:::example
    STOREFORM:::example
    
    %% URL Examples
    ADMINSTORE -.-> EX1["/admin/st0001"]
    STOREADMIN -.-> EX2["/st0001/admin"]
    STOREFORM -.-> EX3["/st0001/forms/abc123"]
```

### 状態管理設計
```mermaid
graph TB
    subgraph "Data Layer"
        SUPABASE[Supabase Client]
        POSTGRES[PostgreSQL]
        AUTH[Supabase Auth]
    end

    subgraph "Service Layer"
        API_ROUTES[Next.js API Routes]
        SERVICES[Service Functions]
        HOOKS[Custom Hooks]
    end

    subgraph "Component Layer"
        PAGES[Page Components]
        COMPONENTS[UI Components]
        CONTEXT[React Context]
    end

    subgraph "State Management"
        SWR[SWR/TanStack Query]
        ZUSTAND[Zustand (Global State)]
        REACT_STATE[React State]
    end

    SUPABASE --> POSTGRES
    SUPABASE --> AUTH
    API_ROUTES --> SUPABASE
    SERVICES --> API_ROUTES
    HOOKS --> SERVICES
    HOOKS --> SWR
    PAGES --> HOOKS
    PAGES --> ZUSTAND
    COMPONENTS --> REACT_STATE
    COMPONENTS --> CONTEXT
```

## ⚙️ バックエンド設計

### Next.js API Routes 設計
```mermaid
graph TB
    subgraph "API Routes"
        ROOT["/api"]
        
        subgraph "Store Management"
            STORES["/api/stores"]
            STORE["/api/stores/[storeId]"]
        end
        
        subgraph "Form Management"
            FORMS["/api/forms"]
            FORM["/api/forms/[formId]"]
            DRAFT["/api/forms/[formId]/draft"]
            PUBLISH["/api/forms/[formId]/publish"]
        end
        
        subgraph "Booking"
            RESERVATIONS["/api/reservations"]
            RESERVATION["/api/reservations/[reservationId]"]
        end
        
        subgraph "File Management"
            UPLOAD["/api/upload"]
            FILES["/api/files/[fileId]"]
        end
        
        subgraph "Auth"
            AUTH_LOGIN["/api/auth/login"]
            AUTH_LOGOUT["/api/auth/logout"]
            AUTH_ME["/api/auth/me"]
        end
    end

    ROOT --> STORES
    ROOT --> FORMS
    ROOT --> RESERVATIONS
    ROOT --> UPLOAD
    ROOT --> AUTH_LOGIN
```

### Supabase Database設計
```mermaid
erDiagram
    STORES {
        uuid id PK
        text name
        text owner_name
        text owner_email
        text phone
        text address
        text description
        text website_url
        text status
        timestamptz created_at
        timestamptz updated_at
    }
    
    FORMS {
        uuid id PK
        uuid store_id FK
        jsonb config
        jsonb draft_config
        text status
        text draft_status
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_published_at
    }
    
    RESERVATIONS {
        uuid id PK
        uuid form_id FK
        uuid store_id FK
        text customer_name
        text customer_phone
        text customer_email
        jsonb selected_menus
        jsonb selected_options
        date reservation_date
        time reservation_time
        jsonb customer_info
        text status
        timestamptz created_at
        timestamptz updated_at
    }
    
    FILES {
        uuid id PK
        uuid store_id FK
        uuid form_id FK
        text file_name
        text file_type
        integer file_size
        text storage_path
        timestamptz created_at
        timestamptz updated_at
    }

    STORES ||--o{ FORMS : "has"
    FORMS ||--o{ RESERVATIONS : "receives"
    STORES ||--o{ FILES : "owns"
    FORMS ||--o{ FILES : "uses"
```

## 🔐 認証・認可設計

### Supabase Auth設計
```mermaid
graph TB
    subgraph "Supabase Auth"
        AUTH_PROVIDER[Auth Provider]
        
        subgraph "User Management"
            USERS[auth.users]
            PROFILES[public.profiles]
        end
        
        subgraph "Authentication Methods"
            EMAIL[Email/Password]
            GOOGLE[Google OAuth]
            MAGIC[Magic Links]
        end
        
        subgraph "Authorization"
            RLS[Row Level Security]
            POLICIES[Security Policies]
            ROLES[User Roles]
        end
    end

    subgraph "Authorization Flow"
        LOGIN[Login]
        JWT[JWT Token]
        MIDDLEWARE[Next.js Middleware]
        API[API Access]
    end

    LOGIN --> JWT
    JWT --> MIDDLEWARE
    MIDDLEWARE --> API
    
    AUTH_PROVIDER --> USERS
    USERS --> PROFILES
    EMAIL --> AUTH_PROVIDER
    GOOGLE --> AUTH_PROVIDER
    MAGIC --> AUTH_PROVIDER
    RLS --> POLICIES
    POLICIES --> ROLES
```

### Row Level Security設計
```mermaid
graph TB
    subgraph "RLS Policies"
        subgraph "Service Admin Policies"
            SA_STORES[stores: SELECT, INSERT, UPDATE, DELETE *]
            SA_FORMS[forms: SELECT, INSERT, UPDATE, DELETE *]
            SA_USERS[profiles: SELECT, INSERT, UPDATE, DELETE *]
        end
        
        subgraph "Store Admin Policies"
            ST_STORES[stores: SELECT own store only]
            ST_FORMS[forms: CRUD own store forms only]
            ST_RESERVATIONS[reservations: CRUD own store only]
        end
        
        subgraph "Customer Policies"
            CU_FORMS[forms: SELECT published forms only]
            CU_RESERVATIONS[reservations: INSERT own reservations]
        end
    end
```

## 🏢 開発環境設計

### 開発環境構成
```mermaid
graph TB
    subgraph "Development Environment"
        subgraph "Local Development"
            NEXT_DEV[Next.js Dev Server<br/>localhost:3000]
            SUPABASE_LOCAL[Supabase Local<br/>Docker Container]
            POSTGRES_LOCAL[PostgreSQL Local<br/>localhost:54322]
        end
        
        subgraph "Development Tools"
            PRISMA[Prisma Studio<br/>Database GUI]
            SUPABASE_CLI[Supabase CLI<br/>Migration Tool]
            NEXT_CLI[Next.js CLI<br/>Development Server]
        end
        
        subgraph "Testing"
            JEST[Jest + RTL<br/>Unit Testing]
            PLAYWRIGHT[Playwright<br/>E2E Testing]
            CYPRESS[Cypress<br/>Component Testing]
        end
    end

    NEXT_DEV --> SUPABASE_LOCAL
    SUPABASE_LOCAL --> POSTGRES_LOCAL
    SUPABASE_CLI --> SUPABASE_LOCAL
    PRISMA --> POSTGRES_LOCAL
```

### 環境切り替え設計
```mermaid
graph LR
    subgraph "Environment Switch"
        ENV[Environment Variables<br/>.env.local / .env.production]
        
        subgraph "Development"
            LOCAL_SUPABASE[Supabase Local<br/>localhost:54321]
            LOCAL_POSTGRES[PostgreSQL Local<br/>localhost:54322]
        end
        
        subgraph "Staging"
            STAGING_SUPABASE[Supabase Staging<br/>Cloud Instance]
        end
        
        subgraph "Production"
            PROD_SUPABASE[Supabase Production<br/>Cloud Instance]
        end
    end

    ENV --> LOCAL_SUPABASE
    ENV --> STAGING_SUPABASE
    ENV --> PROD_SUPABASE
```

## 🚀 本番環境設計

### Vercel + Supabase環境構成
```mermaid
graph TB
    subgraph "Vercel Platform"
        subgraph "Global Edge Network"
            EDGE[Vercel Edge Network<br/>Global CDN]
            EDGE_FUNCTIONS[Edge Functions<br/>Edge Runtime]
        end
        
        subgraph "Compute"
            NEXTJS_APP[Next.js Application<br/>React Server Components]
            API_ROUTES[API Routes<br/>Serverless Functions]
            MIDDLEWARE[Next.js Middleware<br/>Authentication]
        end
        
        subgraph "Build & Deploy"
            BUILD[Vercel Build<br/>Automatic Builds]
            PREVIEW[Preview Deployments<br/>Branch Previews]
        end
    end
    
    subgraph "Supabase Platform"
        subgraph "Database"
            POSTGRES[PostgreSQL<br/>Primary Database]
            REPLICA[Read Replicas<br/>Global Distribution]
        end
        
        subgraph "Services"
            AUTH_SERVICE[Supabase Auth<br/>Authentication Service]
            STORAGE_SERVICE[Supabase Storage<br/>File Storage CDN]
            REALTIME_SERVICE[Realtime<br/>WebSocket Service]
        end
        
        subgraph "Monitoring"
            DASHBOARD[Supabase Dashboard<br/>Database Monitoring]
            LOGS[Database Logs<br/>Query Analytics]
        end
    end

    EDGE --> NEXTJS_APP
    NEXTJS_APP --> API_ROUTES
    API_ROUTES --> POSTGRES
    API_ROUTES --> AUTH_SERVICE
    API_ROUTES --> STORAGE_SERVICE
    MIDDLEWARE --> AUTH_SERVICE
```

### Infrastructure as Code (Supabase)
```mermaid
graph TB
    subgraph "Infrastructure Management"
        subgraph "Supabase CLI"
            SUPABASE_INIT[supabase init]
            SUPABASE_MIGRATIONS[supabase db diff<br/>Migration Generation]
            SUPABASE_DEPLOY[supabase db push<br/>Schema Deployment]
            
            subgraph "Configuration Files"
                CONFIG[supabase/config.toml]
                MIGRATIONS[supabase/migrations/]
                FUNCTIONS[supabase/functions/]
                SEED[supabase/seed.sql]
            end
        end
        
        subgraph "Vercel Configuration"
            VERCEL_JSON[vercel.json]
            ENV_VARS[Environment Variables]
            BUILD_SETTINGS[Build Settings]
        end
    end

    SUPABASE_INIT --> CONFIG
    SUPABASE_MIGRATIONS --> MIGRATIONS
    SUPABASE_DEPLOY --> FUNCTIONS
```

## 📦 CI/CD設計

### デプロイメントパイプライン
```mermaid
graph LR
    subgraph "CI/CD Pipeline"
        subgraph "Source"
            GIT[GitHub Repository]
            PR[Pull Request]
        end
        
        subgraph "CI (GitHub Actions)"
            TEST[Unit Tests<br/>Jest + RTL]
            LINT[Lint & Type Check<br/>ESLint + TypeScript]
            BUILD[Next.js Build<br/>Production Build]
            E2E[E2E Tests<br/>Playwright]
        end
        
        subgraph "Database Migration"
            SUPABASE_DIFF[Supabase DB Diff]
            SUPABASE_PUSH[Supabase DB Push]
        end
        
        subgraph "Deploy"
            VERCEL_PREVIEW[Vercel Preview<br/>Branch Deploy]
            VERCEL_PROD[Vercel Production<br/>Main Branch]
        end
        
        subgraph "Verification"
            HEALTH_CHECK[Health Check]
            SMOKE_TESTS[Smoke Tests]
        end
    end

    GIT --> PR
    PR --> TEST
    TEST --> LINT
    LINT --> BUILD
    BUILD --> E2E
    E2E --> SUPABASE_DIFF
    SUPABASE_DIFF --> SUPABASE_PUSH
    SUPABASE_PUSH --> VERCEL_PREVIEW
    VERCEL_PREVIEW --> VERCEL_PROD
    VERCEL_PROD --> HEALTH_CHECK
    HEALTH_CHECK --> SMOKE_TESTS
```

### 環境戦略
```mermaid
graph TB
    subgraph "Environment Strategy"
        subgraph "Development"
            DEV_LOCAL[Local<br/>localhost:3000]
            DEV_SUPABASE[Supabase Local<br/>Docker]
        end
        
        subgraph "Staging"
            STAGE_VERCEL[Vercel Preview<br/>preview.vercel.app]
            STAGE_SUPABASE[Supabase Staging<br/>Cloud Instance]
        end
        
        subgraph "Production"
            PROD_VERCEL[Vercel Production<br/>booking-forms.com]
            PROD_SUPABASE[Supabase Production<br/>Cloud Instance]
        end
    end

    DEV_LOCAL --> STAGE_VERCEL
    STAGE_VERCEL --> PROD_VERCEL
    DEV_SUPABASE --> STAGE_SUPABASE
    STAGE_SUPABASE --> PROD_SUPABASE
```

## 📊 監視・ログ設計

### 監視アーキテクチャ
```mermaid
graph TB
    subgraph "Monitoring & Logging"
        subgraph "Application Metrics"
            VERCEL_ANALYTICS[Vercel Analytics<br/>Performance Metrics]
            VERCEL_INSIGHTS[Vercel Web Vitals<br/>User Experience]
            NEXTJS_METRICS[Next.js Built-in<br/>Runtime Metrics]
        end
        
        subgraph "Database Monitoring"
            SUPABASE_DASHBOARD[Supabase Dashboard<br/>DB Metrics]
            POSTGRES_LOGS[PostgreSQL Logs<br/>Query Performance]
            CONNECTION_POOL[Connection Pooling<br/>Monitoring]
        end
        
        subgraph "Error Tracking"
            SENTRY[Sentry<br/>Error Monitoring]
            CONSOLE_ERRORS[Browser Console<br/>Client Errors]
            API_ERRORS[API Route Errors<br/>Server Errors]
        end
        
        subgraph "Alerting"
            SLACK[Slack Notifications<br/>Error Alerts]
            EMAIL[Email Alerts<br/>Critical Issues]
            DISCORD[Discord Webhooks<br/>Deploy Notifications]
        end
    end

    VERCEL_ANALYTICS --> VERCEL_INSIGHTS
    SUPABASE_DASHBOARD --> POSTGRES_LOGS
    SENTRY --> SLACK
    SENTRY --> EMAIL
```

## 🔒 セキュリティ設計

### セキュリティ層
```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            VERCEL_FIREWALL[Vercel Firewall<br/>DDoS Protection]
            HTTPS[HTTPS Everywhere<br/>TLS 1.3]
        end
        
        subgraph "Application Security"
            SUPABASE_AUTH[Supabase Auth<br/>JWT Authentication]
            RLS[Row Level Security<br/>Database Authorization]
            CSRF[CSRF Protection<br/>Next.js Built-in]
        end
        
        subgraph "Data Security"
            POSTGRES_ENCRYPTION[PostgreSQL<br/>Encryption at Rest]
            SUPABASE_ENCRYPTION[Supabase Storage<br/>Encryption at Rest]
            TLS_TRANSIT[TLS<br/>Encryption in Transit]
        end
        
        subgraph "Input Validation"
            ZOD[Zod Schema<br/>Runtime Validation]
            SANITIZATION[Input Sanitization<br/>XSS Prevention]
            RATE_LIMITING[Rate Limiting<br/>API Protection]
        end
    end
```

## 📈 スケーラビリティ設計

### 自動スケーリング
```mermaid
graph TB
    subgraph "Auto Scaling Strategy"
        subgraph "Vercel Compute"
            EDGE_FUNCTIONS[Edge Functions<br/>Global Distribution]
            SERVERLESS_FUNCTIONS[Serverless Functions<br/>Auto Scaling]
            ISR[Incremental Static<br/>Regeneration]
        end
        
        subgraph "Supabase Database"
            CONNECTION_POOLING[Connection Pooling<br/>pgBouncer]
            READ_REPLICAS[Read Replicas<br/>Global Distribution]
            AUTO_VACUUM[Auto Vacuum<br/>Performance Optimization]
        end
        
        subgraph "Caching Strategy"
            VERCEL_CACHE[Vercel Edge Cache<br/>Global CDN]
            SWR_CACHE[SWR Cache<br/>Client-side Cache]
            POSTGRES_CACHE[PostgreSQL Cache<br/>Query Cache]
        end
        
        subgraph "Monitoring"
            PERFORMANCE_METRICS[Performance Metrics<br/>Real-time Monitoring]
            SCALING_ALERTS[Scaling Alerts<br/>Proactive Scaling]
        end
    end

    PERFORMANCE_METRICS --> SCALING_ALERTS
    SCALING_ALERTS --> CONNECTION_POOLING
    EDGE_FUNCTIONS --> VERCEL_CACHE
```

この技術設計書により、Next.js + Supabaseを活用した実用的でスケーラブルなアーキテクチャで開発を進められます。従来のAWS構成と比較して、開発効率が大幅に向上し、運用負荷も軽減されます。
