## LIFF / LINE Developers 自動化

### 前提
- 初回のみ：Provider/チャネル/LIFF作成は手動（監査のため）
- 以降：デプロイURL更新や状態確認はAPIで自動

### API
- Update LIFF view URL
```
PUT https://api.line.me/liff/v1/apps/{LIFF_ID}/view
Authorization: Bearer {LINE_CHANNEL_TOKEN}
{
  "type": "tall",
  "url": "https://<vercel-prod-url>"
}
```

### GitHub Actions 例（デプロイ成功後）
```yaml
name: Update LIFF Endpoint (example)
on:
  deployment_status:
    types: [created, success]
jobs:
  update:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: Update LIFF
        run: |
          curl -X PUT \
            "https://api.line.me/liff/v1/apps/${LIFF_ID}/view" \
            -H "Authorization: Bearer ${LINE_CHANNEL_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"tall\",\"url\":\"${DEPLOY_URL}\"}"
        env:
          LIFF_ID: ${{ secrets.LIFF_ID_PROD }}
          LINE_CHANNEL_TOKEN: ${{ secrets.LINE_CHANNEL_TOKEN_PROD }}
          DEPLOY_URL: ${{ github.event.deployment_status.target_url }}
```

### 運用（マルチテナント）
- テナント/環境別に LIFF を分離（dev/prod）
- 管理者ページから tenantId + env + URL で view URL 更新
- Secrets 命名規約（例）：`{TENANT}_LIFF_ID_{ENV}`, `{TENANT}_LINE_CHANNEL_TOKEN_{ENV}`


