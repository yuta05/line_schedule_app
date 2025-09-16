import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Chip,
  Box,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Visibility as PreviewIcon,
  AccessTime as TimeIcon,
  Restaurant as MenuIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../services/localStorageService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const forms = LocalStorageService.getStoreAForms();
  
  const getTotalMenuCount = (form: ReturnType<typeof LocalStorageService.getForms>[0]): number => {
    return form.config.menu_structure.categories.reduce(
      (total: number, category: (typeof form.config.menu_structure.categories)[0]) => 
        total + category.menus.length + category.options.length, 
      0
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          予約フォーム管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          登録された予約フォーム一覧
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          フォーム一覧（{forms.length}件）
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {forms.map((form) => (
          <Card 
            key={form.id}
            elevation={3}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: form.config.basic_info.theme_color,
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    {form.config.basic_info.form_name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {form.config.basic_info.form_name}
                    </Typography>
                    <Chip 
                      label={form.status === 'active' ? 'アクティブ' : '非アクティブ'} 
                      color={form.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  <strong>店舗:</strong> {form.config.basic_info.store_name}
                </Typography>
                
                <Typography color="text.secondary" gutterBottom>
                  <strong>LIFF ID:</strong> {form.config.basic_info.liff_id}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    icon={<CategoryIcon />}
                    label={`${form.config.menu_structure.categories.length}カテゴリー`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<MenuIcon />}
                    label={`${getTotalMenuCount(form)}メニュー`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<TimeIcon />}
                    label={form.config.ui_settings.show_repeat_booking ? '前回メニュー有効' : '基本機能'}
                    size="small"
                    variant="outlined"
                    color={form.config.ui_settings.show_repeat_booking ? 'primary' : 'default'}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  最終更新: {new Date(form.updated_at).toLocaleDateString('ja-JP')}
                </Typography>
              </CardContent>
              
                            <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/forms/${form.id}`)}
                  variant="contained"
                  sx={{ mr: 1 }}
                >
                  編集
                </Button>
                <Button 
                  size="small" 
                  startIcon={<PreviewIcon />}
                  onClick={() => navigate(`/forms/${form.id}/preview`)}
                  variant="text"
                >
                  プレビュー
                </Button>
              </CardActions>
            </Card>
        ))}
      </Box>

      {forms.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            フォームがありません
          </Typography>
          <Typography color="text.secondary">
            サービス管理者によってフォームが作成されると、ここに表示されます
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
