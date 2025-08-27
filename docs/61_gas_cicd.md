## GAS CI/CD（clasp + Apps Script API）

### ポリシー
- 環境ごとに scriptId を分離（dev/prod）
- `clasp push` → `version` → `deploy` を Actions で実行
- Script Properties を Apps Script API で同期

### ワークフロー（擬似コード, tenant対応）
```yaml
name: GAS Deploy (prod)
on: { workflow_dispatch: {} }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm i -g @google/clasp
      - name: Auth clasp
        run: echo '${{ secrets.GOOGLE_CREDENTIALS }}' > ~/.clasprc.json
      - name: Deploy (matrix)
        run: |
          APP=${{ github.event.inputs.app }}
          ENV=${{ github.event.inputs.environment }}
          TENANT=${{ github.event.inputs.tenant }}
          case "$APP" in
            availability) SID_PROD=${{ secrets.GAS_AVAILABILITY_SCRIPT_ID_PROD }}; SID_DEV=${{ secrets.GAS_AVAILABILITY_SCRIPT_ID_DEV }} ;;
            reservation)  SID_PROD=${{ secrets.GAS_RESERVATION_SCRIPT_ID_PROD }};  SID_DEV=${{ secrets.GAS_RESERVATION_SCRIPT_ID_DEV }} ;;
            reminder)     SID_PROD=${{ secrets.GAS_REMINDER_SCRIPT_ID_PROD }};     SID_DEV=${{ secrets.GAS_REMINDER_SCRIPT_ID_DEV }} ;;
          esac
          SID=$([ "$ENV" = "prod" ] && echo $SID_PROD || echo $SID_DEV)
          echo '{"scriptId":"'"$SID"'","rootDir":"./apps/gas-'"$APP"'/src"}' > .clasp.json
          cd apps/gas-$APP
          clasp push -f
          clasp version "deploy $(date +%s)"
          clasp deploy -d "$ENV"
      - name: Update Script Properties (tenant override)
        run: |
          # 本リポでは curl で adminエンドポイントに POST し同期（gas_deploy.yml を参照）
```

### Properties（例）
- CHANNEL_ACCESS_TOKEN
- CALENDAR_ID
- RULES_JSON_HASH（変更検知用）


