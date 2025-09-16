# AWS移行設計書

## 概要

ローカル開発環境で動作しているLINE予約フォーム管理システムをAWSクラウド環境に移行するための設計書です。

## 🏗 アーキテクチャ概要

### 現在の構成（ローカル開発）
- **Frontend**: React + TypeScript + Vite
- **Data Storage**: LocalStorage
- **File Storage**: Base64エンコーディング（インメモリ）
- **API**: なし（フロントエンドのみ）

### AWS移行後の構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │    API Gateway  │    │    Lambda       │
│   (CDN + WAF)   │────│  (REST API)     │────│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     S3 Bucket   │    │   DynamoDB      │    │      S3         │
│ (Static Hosting)│    │ (NoSQL Database)│    │ (File Storage)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 AWSサービス構成

### 1. フロントエンド

#### **Amazon S3 + CloudFront**
- **S3 Bucket**: 静的ウェブサイトホスティング
  - React buildファイルの配信
  - バージョニング有効化
  - パブリックアクセス制御
- **CloudFront**: CDN + セキュリティ
  - 全世界への高速配信
  - HTTPS強制
  - AWS WAF統合
  - キャッシュ戦略設定

#### 設定例
```yaml
S3 Bucket Configuration:
  Bucket Name: line-booking-form-frontend
  Public Access: CloudFront経由のみ
  Versioning: Enabled
  Encryption: AES-256

CloudFront Configuration:
  Origin: S3 Bucket
  Viewer Protocol Policy: Redirect HTTP to HTTPS
  Compress Objects: Yes
  Default Root Object: index.html
  Error Pages: 
    - 403 -> /index.html (SPAルーティング対応)
    - 404 -> /index.html
```

### 2. バックエンドAPI

#### **AWS Lambda + API Gateway**
- **API Gateway**: RESTful API エンドポイント
  - CORS設定
  - 認証・認可（IAM / Cognito）
  - レート制限
  - APIキー管理
- **Lambda Functions**: サーバーレス処理
  - Node.js 18.x runtime
  - 環境変数による設定管理
  - VPC接続（必要に応じて）

#### API設計
```
POST   /api/forms                    # フォーム作成
GET    /api/forms                    # フォーム一覧取得
GET    /api/forms/{id}               # フォーム詳細取得
PUT    /api/forms/{id}               # フォーム更新
DELETE /api/forms/{id}               # フォーム削除

POST   /api/forms/{id}/draft         # ドラフト保存
POST   /api/forms/{id}/publish       # 公開
POST   /api/forms/{id}/discard-draft # ドラフト破棄

POST   /api/reservations             # 予約作成
GET    /api/reservations             # 予約一覧
PUT    /api/reservations/{id}        # 予約更新

POST   /api/upload                   # ファイルアップロード
GET    /api/files/{id}               # ファイル取得
```

### 3. データベース

#### **Amazon DynamoDB**
- **NoSQL**: スケーラブルな性能
- **Single Table Design**: 効率的なクエリ
- **GSI**: セカンダリインデックス
- **TTL**: 一時データの自動削除

#### テーブル設計
```yaml
Table Name: line-booking-system
Partition Key: PK (String)
Sort Key: SK (String)
GSI1: GSI1PK, GSI1SK
GSI2: GSI2PK, GSI2SK

データパターン:
# フォーム
PK: FORM#<formId>
SK: METADATA
GSI1PK: TENANT#<tenantId>
GSI1SK: FORM#<formId>

# ドラフト
PK: FORM#<formId>
SK: DRAFT
TTL: <expiration>

# 予約
PK: FORM#<formId>
SK: RESERVATION#<reservationId>
GSI1PK: DATE#<date>
GSI1SK: TIME#<time>

# メニュー
PK: FORM#<formId>
SK: MENU#<menuId>
```

### 4. ファイルストレージ

#### **Amazon S3**
- **Private Bucket**: メニュー画像等
- **Presigned URLs**: 一時的なアクセス
- **Lifecycle Policies**: 古いファイルの自動削除
- **Cross-Region Replication**: 冗長化（オプション）

#### 設定例
```yaml
Bucket Name: line-booking-form-assets
Public Access: Blocked
Versioning: Enabled
Encryption: SSE-S3
Lifecycle Rules:
  - Delete incomplete multipart uploads after 1 day
  - Transition to IA after 30 days
  - Delete after 1 year (configurable)
```

### 5. 認証・認可

#### **Amazon Cognito**
- **User Pools**: 管理者認証
- **Identity Pools**: 一時的クレデンシャル
- **Social Login**: LINE Login統合（オプション）

#### 設定例
```yaml
User Pool:
  Name: line-booking-admins
  Attributes: email, phone_number
  Password Policy: Strong
  MFA: Optional (TOTP)
  
Identity Pool:
  Name: line-booking-identity
  Authenticated Role: 管理者用IAMロール
  Unauthenticated Role: 顧客用IAMロール（読み取り専用）
```

## 📋 移行手順

### Phase 1: インフラ構築
1. **AWS Account Setup**
   - AWS組織アカウント作成
   - IAMユーザー・ロール設定
   - 請求アラート設定

2. **Core Infrastructure**
   ```bash
   # Terraform/CDKでインフラ構築
   aws cloudformation deploy --template infrastructure.yaml
   ```

3. **Database Setup**
   - DynamoDB テーブル作成
   - インデックス設定
   - バックアップ設定

### Phase 2: バックエンド開発
1. **API Development**
   ```typescript
   // Lambda Function例
   export const handler = async (event: APIGatewayEvent) => {
     const { httpMethod, pathParameters, body } = event;
     
     switch (httpMethod) {
       case 'GET':
         return await getForms(pathParameters?.id);
       case 'POST':
         return await createForm(JSON.parse(body));
       // ...
     }
   };
   ```

2. **Data Migration**
   ```typescript
   // LocalStorageからDynamoDBへのマイグレーション
   const migrationScript = async () => {
     const localData = localStorage.getItem('forms');
     const forms = JSON.parse(localData);
     
     for (const form of forms) {
       await dynamodb.putItem({
         TableName: 'line-booking-system',
         Item: {
           PK: `FORM#${form.id}`,
           SK: 'METADATA',
           ...form
         }
       }).promise();
     }
   };
   ```

### Phase 3: フロントエンド移行
1. **API Integration**
   ```typescript
   // services/apiService.ts
   class ApiService {
     private baseUrl = process.env.VITE_API_BASE_URL;
     
     async getForms(): Promise<Form[]> {
       const response = await fetch(`${this.baseUrl}/forms`);
       return response.json();
     }
     
     async createForm(form: FormConfig): Promise<Form> {
       const response = await fetch(`${this.baseUrl}/forms`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(form)
       });
       return response.json();
     }
   }
   ```

2. **Environment Configuration**
   ```bash
   # .env.production
   VITE_API_BASE_URL=https://api.example.com
   VITE_AWS_REGION=ap-northeast-1
   VITE_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
   VITE_USER_POOL_CLIENT_ID=abcdefghijklmnop
   ```

### Phase 4: デプロイメント
1. **CI/CD Pipeline**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to AWS
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - name: Deploy to S3
           run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}
         - name: Invalidate CloudFront
           run: aws cloudfront create-invalidation --distribution-id ${{ secrets.DISTRIBUTION_ID }} --paths "/*"
   ```

## 💰 コスト概算

### 月間コスト予想（小規模運用）
```
サービス                 月間コスト（USD）
─────────────────────────────────────
S3 (Frontend)           $1-3
CloudFront              $1-5
Lambda                  $0-10
API Gateway             $3-10
DynamoDB               $5-25
S3 (Assets)            $1-5
Route 53               $0.5
CloudWatch             $1-3
─────────────────────────────────────
合計                    $12-62
```

### スケーリング時のコスト
- **中規模（月1000予約）**: $50-150
- **大規模（月10000予約）**: $200-500

## 🔒 セキュリティ考慮事項

### 1. データ保護
- **暗号化**: 転送時・保存時の暗号化
- **アクセス制御**: IAMポリシーによる最小権限
- **監査ログ**: CloudTrailによる操作ログ

### 2. ネットワークセキュリティ
- **WAF**: SQLインジェクション・XSS対策
- **DDoS Protection**: CloudFrontによる保護
- **VPC**: 必要に応じてプライベートネットワーク

### 3. 認証・認可
- **多要素認証**: 管理者アカウント
- **JWT Token**: API認証
- **セッション管理**: 適切な有効期限設定

## 📊 監視・運用

### 1. モニタリング
- **CloudWatch**: メトリクス・ログ監視
- **X-Ray**: 分散トレーシング
- **AWS Config**: リソース設定監視

### 2. アラート設定
```yaml
Alerts:
  - Error Rate > 5%
  - Response Time > 3000ms
  - DynamoDB Throttling
  - S3 4xx/5xx Errors
  - Lambda Cold Start > 1000ms
```

### 3. バックアップ・災害復旧
- **DynamoDB**: Point-in-time recovery
- **S3**: Cross-region replication
- **Code**: GitHubバックアップ
- **RTO**: 4時間以内
- **RPO**: 1時間以内

## 🎯 移行スケジュール

```
Week 1-2:  要件定義・設計詳細化
Week 3-4:  AWS環境構築
Week 5-8:  バックエンドAPI開発
Week 9-10: フロントエンド統合
Week 11:   テスト・デバッグ
Week 12:   本番デプロイ・運用開始
```

## 📝 移行チェックリスト

### 事前準備
- [ ] AWS アカウント作成・設定
- [ ] ドメイン取得・DNS設定
- [ ] SSL証明書取得
- [ ] 開発・本番環境分離

### 開発
- [ ] API仕様書作成
- [ ] データベース設計
- [ ] Lambda関数実装
- [ ] フロントエンド統合
- [ ] テストケース作成

### 運用準備
- [ ] 監視・アラート設定
- [ ] バックアップ戦略
- [ ] 災害復旧手順
- [ ] 運用マニュアル作成
- [ ] セキュリティ監査

### 移行作業
- [ ] データ移行スクリプト
- [ ] 動作確認テスト
- [ ] パフォーマンステスト
- [ ] セキュリティテスト
- [ ] 本番切り替え

この設計書に基づいて段階的に移行を進めることで、安全で拡張性のあるクラウドシステムを構築できます。
