import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  OpenInNew,
  Refresh
} from '@mui/icons-material';
import type { Form } from '../types/form';
import { LocalStorageService } from '../services/localStorageService';

const FormPreview: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('FormPreview useEffect triggered, formId:', formId);
    if (formId) {
      const foundForm = LocalStorageService.getForm(formId);
      console.log('Found form:', foundForm);
      if (foundForm) {
        setForm(foundForm);
      } else {
        console.log('Form not found, redirecting to dashboard');
        navigate('/dashboard');
      }
    }
    setLoading(false);
  }, [formId, navigate]);

  const handleOpenCustomerForm = () => {
    if (formId) {
      window.open(`/form/${formId}`, '_blank');
    }
  };

  const handleRefresh = () => {
    if (formId) {
      const foundForm = LocalStorageService.getForm(formId);
      if (foundForm) {
        setForm(foundForm);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>フォームが見つかりません...</Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          ダッシュボードに戻る
        </Button>
      </Box>
    );
  }

  const customerFormUrl = `/form/${formId}`;

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1300
    }}>
      {/* トップバー */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(`/forms/${formId}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {(form.draft_config || form.config).basic_info.form_name} - プレビュー
            {form.draft_status === 'draft' && (
              <Chip 
                label="ドラフト" 
                size="small" 
                color="warning" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Button 
            color="inherit" 
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            更新
          </Button>
          <Button 
            color="inherit" 
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={handleOpenCustomerForm}
          >
            新しいタブで開く
          </Button>
        </Toolbar>
      </AppBar>

      {/* プレビューエリア */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* サイドバー - フォーム情報 */}
        <Box sx={{ width: 300, p: 2, bgcolor: 'grey.50', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            フォーム情報
            {form.draft_status === 'draft' && (
              <Chip 
                label="ドラフト版を表示中" 
                size="small" 
                color="warning" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          
          {form.draft_status === 'draft' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ドラフト版のプレビューを表示しています。公開するまで顧客には反映されません。
              </Typography>
            </Alert>
          )}
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: (form.draft_config || form.config).basic_info.theme_color,
                    mr: 2
                  }}
                >
                  {(form.draft_config || form.config).basic_info.store_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {(form.draft_config || form.config).basic_info.form_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(form.draft_config || form.config).basic_info.store_name}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" gutterBottom>
                <strong>LIFF ID:</strong> {(form.draft_config || form.config).basic_info.liff_id}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>テーマカラー:</strong> {(form.draft_config || form.config).basic_info.theme_color}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>ステータス:</strong>
                <Chip 
                  size="small" 
                  label={form.status === 'active' ? 'アクティブ' : '非アクティブ'}
                  color={form.status === 'active' ? 'success' : 'default'}
                  sx={{ ml: 1 }}
                />
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                来店オプション
              </Typography>
              {(form.draft_config || form.config).visit_options.map((option) => (
                <Box key={option.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {option.label} - ¥{option.price.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                メニュー構成
              </Typography>
              {(form.draft_config || form.config).menu_structure.categories.map((category) => (
                <Box key={category.id} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {category.display_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.menus.length}メニュー + {(category.options || []).length}オプション
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                表示設定
              </Typography>
              <Typography variant="body2">
                料金表示: {(form.draft_config || form.config).menu_structure.display_options.show_price ? '有効' : '無効'}
              </Typography>
              <Typography variant="body2">
                時間表示: {(form.draft_config || form.config).menu_structure.display_options.show_duration ? '有効' : '無効'}
              </Typography>
              <Typography variant="body2">
                説明表示: {(form.draft_config || form.config).menu_structure.display_options.show_description ? '有効' : '無効'}
              </Typography>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {form.draft_status === 'draft' 
                ? 'このプレビューはドラフト版の内容です。'
                : 'このプレビューは実際の顧客向けフォームと同じ表示です。'
              }
            </Typography>
          </Alert>
        </Box>

        {/* プレビューフレーム */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <Box
            sx={{
              width: 375,
              height: 667,
              maxHeight: '100%',
              border: '8px solid #333',
              borderRadius: '20px',
              overflow: 'hidden',
              bgcolor: 'white',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                bgcolor: '#333',
                borderRadius: '0 0 4px 4px'
              }}
            />
            
            <iframe
              src={customerFormUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Customer Form Preview"
            />
          </Box>
        </Box>
      </Box>

      {/* フッター情報 */}
      <Box sx={{ p: 1, bgcolor: 'grey.100', borderTop: '1px solid', borderColor: 'grey.300' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'center' }}>
          プレビューURL: {window.location.origin}{customerFormUrl} | 
          最終更新: {new Date(form.updated_at).toLocaleString('ja-JP')}
        </Typography>
      </Box>
    </Box>
  );
};

export default FormPreview;
