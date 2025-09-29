import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
  Chip,
  Avatar,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Palette as PaletteIcon, Store as StoreIcon } from '@mui/icons-material';
import type { Form } from '../../types/form';

interface BasicInfoEditorProps {
  form: Form;
  onUpdate: (updatedForm: Form) => void;
  onHasChanges?: (hasChanges: boolean) => void; // 変更状態を親に通知
  onSaveRequest?: number; // 外部からの保存要求カウンター
}

const BasicInfoEditor: React.FC<BasicInfoEditorProps> = ({ form, onUpdate, onHasChanges, onSaveRequest }) => {
  const currentConfig = form.draft_config || form.config;
  
  const [formName, setFormName] = useState(currentConfig.basic_info.form_name);
  const [storeName, setStoreName] = useState(currentConfig.basic_info.store_name);
  const [themeColor, setThemeColor] = useState(currentConfig.basic_info.theme_color);
  const [logoUrl, setLogoUrl] = useState(currentConfig.basic_info.logo_url || '');
  
  // 性別選択設定
  const [genderEnabled, setGenderEnabled] = useState(currentConfig.gender_selection?.enabled || false);
  const [genderRequired, setGenderRequired] = useState(currentConfig.gender_selection?.required || false);
  
  const [hasChanges, setHasChanges] = useState(false);

    // 保存処理
  const handleSave = useCallback(() => {
    const updatedDraftConfig = {
      ...currentConfig,
      basic_info: {
        ...currentConfig.basic_info,
        form_name: formName,
        store_name: storeName,
        theme_color: themeColor,
        logo_url: logoUrl || undefined
      },
      gender_selection: {
        ...currentConfig.gender_selection,
        enabled: genderEnabled,
        required: genderRequired
      },
      ui_settings: {
        ...currentConfig.ui_settings,
        theme_color: themeColor
      }
    };

    const updatedForm = {
      ...form,
      draft_config: updatedDraftConfig
    };

    onUpdate(updatedForm);
    setHasChanges(false);
  }, [form, formName, storeName, themeColor, logoUrl, genderEnabled, genderRequired, onUpdate, currentConfig]);

  // 変更検出
  useEffect(() => {
    const hasAnyChanges = 
      formName !== currentConfig.basic_info.form_name ||
      storeName !== currentConfig.basic_info.store_name ||
      themeColor !== currentConfig.basic_info.theme_color ||
      logoUrl !== (currentConfig.basic_info.logo_url || '') ||
      genderEnabled !== (currentConfig.gender_selection?.enabled || false) ||
      genderRequired !== (currentConfig.gender_selection?.required || false);
    
    setHasChanges(hasAnyChanges);
    onHasChanges?.(hasAnyChanges);
  }, [formName, storeName, themeColor, logoUrl, genderEnabled, genderRequired, currentConfig, onHasChanges]);

  // 外部からの保存要求を処理
  useEffect(() => {
    if (onSaveRequest && onSaveRequest > 0 && hasChanges) {
      handleSave();
    }
  }, [onSaveRequest, hasChanges, handleSave]);

  const handleReset = () => {
    setFormName(currentConfig.basic_info.form_name);
    setStoreName(currentConfig.basic_info.store_name);
    setThemeColor(currentConfig.basic_info.theme_color);
    setLogoUrl(currentConfig.basic_info.logo_url || '');
    setGenderEnabled(currentConfig.gender_selection?.enabled || false);
    setGenderRequired(currentConfig.gender_selection?.required || false);
    setHasChanges(false);
  };

  const presetColors = [
    '#13ca5e', '#2196f3', '#ff9800', '#e91e63', 
    '#9c27b0', '#673ab7', '#3f51b5', '#00bcd4',
    '#4caf50', '#ffeb3b', '#ff5722', '#795548'
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {hasChanges && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleReset} sx={{ mr: 1 }}>
                リセット
              </Button>
              <Button color="inherit" size="small" onClick={handleSave} variant="outlined">
                保存
              </Button>
            </Box>
          }
        >
          変更があります。保存してください。
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* フォーム基本情報 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <StoreIcon />
              </Avatar>
              <Typography variant="h6">
                フォーム基本情報
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="フォーム名"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                helperText="顧客に表示されるフォームのタイトル"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="店舗名"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                helperText="店舗の正式名称"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="ロゴURL（オプション）"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                helperText="店舗ロゴ画像のURL"
                variant="outlined"
                sx={{ gridColumn: { md: 'span 2' } }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* テーマカラー設定 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <PaletteIcon />
              </Avatar>
              <Typography variant="h6">
                テーマカラー設定
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="カラーコード"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                helperText="16進数カラーコード（例：#13ca5e）"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: themeColor,
                        borderRadius: 1,
                        mr: 1,
                        border: 1,
                        borderColor: 'grey.300'
                      }}
                    />
                  )
                }}
              />
              <Box>
                <Typography variant="body2" gutterBottom>
                  プリセットカラー
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {presetColors.map((color) => (
                    <Chip
                      key={color}
                      onClick={() => setThemeColor(color)}
                      sx={{
                        bgcolor: color,
                        color: 'white',
                        '&:hover': {
                          bgcolor: color,
                          opacity: 0.8
                        },
                        ...(themeColor === color && {
                          border: 2,
                          borderColor: 'grey.800'
                        })
                      }}
                      label={color}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="textSecondary">
              <strong>プレビュー：</strong> このテーマカラーがボタンやアクセントカラーとして使用されます
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: themeColor, mr: 2 }}
              >
                サンプルボタン
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: themeColor, color: themeColor }}
              >
                アウトラインボタン
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 性別選択設定 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              性別選択設定
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              フォームで性別を選択させる場合の設定を行います
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={genderEnabled}
                    onChange={(e) => setGenderEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="性別選択を有効にする"
              />
              
              {genderEnabled && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={genderRequired}
                      onChange={(e) => setGenderRequired(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="性別選択を必須にする"
                />
              )}
              
              {genderEnabled && (
                <Alert severity="info">
                  性別選択を有効にすると、メニューカテゴリーに性別による表示条件を設定できるようになります。
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* フォーム情報 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              フォーム情報
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Typography variant="body2" color="textSecondary">
                フォームID: <strong>{form.id}</strong>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" component="span">
                  ステータス: 
                </Typography>
                <Chip 
                  size="small" 
                  label={form.status === 'active' ? 'アクティブ' : '非アクティブ'}
                  color={form.status === 'active' ? 'success' : 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                作成日: {new Date(form.created_at).toLocaleDateString('ja-JP')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                更新日: {new Date(form.updated_at).toLocaleDateString('ja-JP')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BasicInfoEditor;
