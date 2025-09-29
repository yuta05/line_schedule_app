import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Container
} from '@mui/material';
import {
  Store,
  Restaurant,
  Schedule,
  Image,
  Person,
  Close as CloseIcon
} from '@mui/icons-material';
import type { Form, MenuItem, MenuSelections, MenuOption } from '../types/form';
import { LocalStorageService } from '../services/localStorageService';
import CalendarSelector from '../components/Calendar/CalendarSelector';

const CustomerForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  
  console.log('CustomerForm rendering - formId:', formId, 'previewMode:', isPreviewMode);
  
  const [form, setForm] = useState<Form | null>(null);
  
  // プレビューモードの場合はドラフト設定、通常モードの場合は公開設定を使用
  const getActiveConfig = () => {
    if (!form) return null;
    return isPreviewMode && form.draft_config ? form.draft_config : form.config;
  };
  
  const [loading, setLoading] = useState(true);
  const [imagePopup, setImagePopup] = useState<{
    open: boolean;
    imageUrl?: string;
    imageName?: string;
    menuName?: string;
  }>({ open: false });
  
  const [selections, setSelections] = useState<MenuSelections>({
    visit_option: null,
    gender: undefined,
    selected_menus: [],
    selected_options: [],
    customer_info: {
      name: '',
      phone: '',
      message: ''
    },
    selected_datetime: null
  });

  useEffect(() => {
    if (formId) {
      const formData = LocalStorageService.getForm(formId);
      if (formData) {
        setForm(formData);
      }
      setLoading(false);
    }
  }, [formId]);

  const handleMenuToggle = (menu: MenuItem) => {
    setSelections(prev => {
      const isSelected = prev.selected_menus.some(m => m.id === menu.id);
      if (isSelected) {
        return {
          ...prev,
          selected_menus: prev.selected_menus.filter(m => m.id !== menu.id)
        };
      } else {
        return {
          ...prev,
          selected_menus: [...prev.selected_menus, menu]
        };
      }
    });
  };

  const handleOptionToggle = (option: MenuOption) => {
    setSelections(prev => {
      const isSelected = prev.selected_options.some(o => o.id === option.id);
      if (isSelected) {
        return {
          ...prev,
          selected_options: prev.selected_options.filter(o => o.id !== option.id)
        };
      } else {
        return {
          ...prev,
          selected_options: [...prev.selected_options, option]
        };
      }
    });
  };

  const handleImageClick = (imageUrl: string, imageName?: string, menuName?: string) => {
    setImagePopup({
      open: true,
      imageUrl,
      imageName,
      menuName
    });
  };

  const handleCloseImagePopup = () => {
    setImagePopup({ open: false });
  };

  const isFormValid = () => {
    return (
      selections.visit_option &&
      selections.selected_menus.length > 0 &&
      selections.selected_datetime &&
      selections.customer_info?.name &&
      selections.customer_info?.phone &&
      (!getActiveConfig()?.gender_selection?.enabled || 
       !getActiveConfig()?.gender_selection?.required || 
       selections.gender)
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid() || !form) return;

    try {
      // 予約データの作成
      const bookingData = {
        form_id: form.id,
        customer_info: selections.customer_info!,
        selected_menus: selections.selected_menus,
        selected_options: selections.selected_options,
        visit_option: selections.visit_option!,
        gender: selections.gender,
        selected_datetime: selections.selected_datetime!,
        total_price: selections.selected_menus.reduce((sum, menu) => sum + menu.price, 0) +
                    selections.selected_options.reduce((sum, option) => sum + option.price, 0),
        total_duration: selections.selected_menus.reduce((sum, menu) => sum + menu.duration, 0) +
                       selections.selected_options.reduce((sum, option) => sum + option.duration, 0),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // 予約完了処理（実際の実装では適切なAPI呼び出しが必要）
      console.log('予約データ:', bookingData);

      alert('予約が完了しました！確認メールをお送りします。');
      
      // フォームをリセット
      setSelections({
        visit_option: null,
        gender: undefined,
        selected_menus: [],
        selected_options: [],
        customer_info: {
          name: '',
          phone: '',
          message: ''
        },
        selected_datetime: null
      });
      
    } catch (error) {
      console.error('予約の送信に失敗しました:', error);
      alert('予約の送信に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      py: 2
    }}>
      <Container maxWidth="sm">
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && !form && (
          <Alert severity="error">
            フォームが見つかりません
          </Alert>
        )}
        
        {!loading && form && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* ヘッダー */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              {getActiveConfig()?.basic_info.logo_url && (
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={getActiveConfig()?.basic_info.logo_url} 
                    alt="ロゴ" 
                    style={{ maxHeight: 60 }}
                  />
                </Box>
              )}
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {getActiveConfig()?.basic_info.form_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {getActiveConfig()?.basic_info.store_name}
              </Typography>
              {isPreviewMode && (
                <Chip 
                  label="プレビューモード" 
                  color="warning" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              )}
            </Paper>

            {/* 性別選択セクション */}
            {getActiveConfig()?.gender_selection?.enabled && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: getActiveConfig()?.basic_info.theme_color }} />
                  性別を選択してください
                  {getActiveConfig()?.gender_selection?.required && (
                    <Typography component="span" color="error" sx={{ ml: 1 }}>
                      *
                    </Typography>
                  )}
                </Typography>
                <RadioGroup
                  value={selections.gender || ''}
                  onChange={(e) => {
                    setSelections(prev => ({
                      ...prev,
                      gender: e.target.value as 'male' | 'female'
                    }));
                  }}
                >
                  {getActiveConfig()?.gender_selection?.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            )}

            {/* 来店オプション選択セクション */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Store sx={{ mr: 1, color: getActiveConfig()?.basic_info.theme_color }} />
                来店方法を選択してください
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  *
                </Typography>
              </Typography>
              <RadioGroup
                value={selections.visit_option?.id || ''}
                onChange={(e) => {
                  const option = getActiveConfig()?.visit_options.find(opt => opt.id === e.target.value);
                  setSelections(prev => ({
                    ...prev,
                    visit_option: option || null
                  }));
                }}
              >
                {getActiveConfig()?.visit_options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </Paper>

            {/* メニュー選択セクション */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Restaurant sx={{ mr: 1, color: getActiveConfig()?.basic_info.theme_color }} />
                メニューを選択してください
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  *
                </Typography>
              </Typography>
              
              {getActiveConfig()?.menu_structure.categories
                .filter(category => {
                  // 性別選択が無効の場合は、全てのカテゴリーを表示
                  if (!getActiveConfig()?.gender_selection?.enabled) {
                    return true;
                  }
                  
                  // 性別選択が有効だが、まだ性別が選択されていない場合は、
                  // 性別条件が設定されていないカテゴリーのみ表示
                  if (!selections.gender) {
                    return !category.gender_condition || category.gender_condition === 'all';
                  }
                  
                  // 性別が選択されている場合は、その性別に対応するカテゴリーを表示
                  return category.gender_condition === 'all' || 
                         category.gender_condition === selections.gender ||
                         !category.gender_condition;
                })
                .map((category) => (
                <Box key={category.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {category.display_name}
                  </Typography>
                  
                  {/* メインメニュー */}
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {category.menus
                      .filter(menu => {
                        // 性別選択が無効の場合は、全てのメニューを表示
                        if (!getActiveConfig()?.gender_selection?.enabled) {
                          return true;
                        }
                        
                        // 性別が選択されていない場合は、性別条件なしのメニューのみ表示
                        if (!selections.gender) {
                          return !menu.gender_filter || menu.gender_filter === 'both';
                        }
                        
                        // 性別が選択されている場合は、その性別に対応するメニューを表示
                        return menu.gender_filter === 'both' || 
                               menu.gender_filter === selections.gender ||
                               !menu.gender_filter;
                      })
                      .map((menu) => (
                      <Card 
                        key={menu.id}
                        sx={{ 
                          cursor: 'pointer',
                          border: selections.selected_menus.some(m => m.id === menu.id) ? 2 : 1,
                          borderColor: selections.selected_menus.some(m => m.id === menu.id) 
                            ? getActiveConfig()?.basic_info.theme_color 
                            : 'grey.300'
                        }}
                        onClick={() => handleMenuToggle(menu)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {menu.name}
                                </Typography>
                                {menu.image_url && (
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleImageClick(menu.image_url!, menu.image_name, menu.name);
                                    }}
                                  >
                                    <Image fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              {menu.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {menu.description}
                                </Typography>
                              )}
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                ¥{menu.price.toLocaleString()} / {menu.duration}分
                              </Typography>
                            </Box>
                            <Checkbox
                              checked={selections.selected_menus.some(m => m.id === menu.id)}
                              onChange={() => handleMenuToggle(menu)}
                              sx={{
                                color: getActiveConfig()?.basic_info.theme_color,
                                '&.Mui-checked': {
                                  color: getActiveConfig()?.basic_info.theme_color,
                                },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                  
                  {/* オプションメニュー */}
                  {category.options && category.options.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        オプション
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1 }}>
                        {category.options
                          .filter(optionMenu => {
                            // 性別選択が無効の場合は、全てのオプションを表示
                            if (!getActiveConfig()?.gender_selection?.enabled) {
                              return true;
                            }
                            
                            // 性別が選択されていない場合は、性別条件なしのオプションのみ表示
                            if (!selections.gender) {
                              return !optionMenu.gender_filter || optionMenu.gender_filter === 'both';
                            }
                            
                            // 性別が選択されている場合は、その性別に対応するオプションを表示
                            return optionMenu.gender_filter === 'both' || 
                                   optionMenu.gender_filter === selections.gender ||
                                   !optionMenu.gender_filter;
                          })
                          .map((optionMenu) => (
                          <Card 
                            key={optionMenu.id}
                            variant="outlined"
                            sx={{ 
                              cursor: 'pointer',
                              border: selections.selected_options.some(o => o.id === optionMenu.id) ? 1 : 0.5,
                              borderColor: selections.selected_options.some(o => o.id === optionMenu.id) 
                                ? getActiveConfig()?.basic_info.theme_color 
                                : 'grey.300'
                            }}
                            onClick={() => handleOptionToggle(optionMenu)}
                          >
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {optionMenu.name}
                                    </Typography>
                                    {optionMenu.image_url && (
                                      <IconButton 
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleImageClick(optionMenu.image_url!, optionMenu.image_name, optionMenu.name);
                                        }}
                                      >
                                        <Image fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  {optionMenu.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {optionMenu.description}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                    +¥{optionMenu.price.toLocaleString()} / +{optionMenu.duration}分
                                  </Typography>
                                </Box>
                                <Checkbox
                                  size="small"
                                  checked={selections.selected_options.some(o => o.id === optionMenu.id)}
                                  onChange={() => handleOptionToggle(optionMenu)}
                                  sx={{
                                    color: getActiveConfig()?.basic_info.theme_color,
                                    '&.Mui-checked': {
                                      color: getActiveConfig()?.basic_info.theme_color,
                                    },
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>

            {/* 日時選択セクション */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: getActiveConfig()?.basic_info.theme_color }} />
                希望日時を選択してください
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  *
                </Typography>
              </Typography>
              <CalendarSelector
                onDateTimeSelect={(dateTime) => {
                  setSelections(prev => ({
                    ...prev,
                    selected_datetime: new Date(dateTime)
                  }));
                }}
                selectedDate={selections.selected_datetime?.toISOString().split('T')[0]}
              />
            </Paper>

            {/* お客様情報入力セクション */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, color: getActiveConfig()?.basic_info.theme_color }} />
                お客様情報
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  fullWidth
                  label="お名前"
                  required
                  value={selections.customer_info?.name || ''}
                  onChange={(e) => {
                    setSelections(prev => ({
                      ...prev,
                      customer_info: {
                        ...prev.customer_info!,
                        name: e.target.value
                      }
                    }));
                  }}
                />
                <TextField
                  fullWidth
                  label="電話番号"
                  required
                  value={selections.customer_info?.phone || ''}
                  onChange={(e) => {
                    setSelections(prev => ({
                      ...prev,
                      customer_info: {
                        ...prev.customer_info!,
                        phone: e.target.value
                      }
                    }));
                  }}
                />
                <TextField
                  fullWidth
                  label="メッセージ（任意）"
                  multiline
                  rows={3}
                  value={selections.customer_info?.message || ''}
                  onChange={(e) => {
                    setSelections(prev => ({
                      ...prev,
                      customer_info: {
                        ...prev.customer_info!,
                        message: e.target.value
                      }
                    }));
                  }}
                />
              </Box>
            </Paper>

            {/* 予約確認セクション */}
            {(selections.selected_menus.length > 0 || selections.selected_options.length > 0) && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  予約内容確認
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      選択したメニュー
                    </Typography>
                    {selections.selected_menus.map((menu) => (
                      <Box key={menu.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{menu.name}</Typography>
                        <Typography variant="body2">¥{menu.price.toLocaleString()}</Typography>
                      </Box>
                    ))}
                    
                    {/* オプション表示 */}
                    {selections.selected_options.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                          オプション
                        </Typography>
                        {selections.selected_options.map((option) => (
                          <Box key={option.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">+ {option.name}</Typography>
                            <Typography variant="body2" color="text.secondary">+¥{option.price.toLocaleString()}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <Typography variant="subtitle2">合計金額</Typography>
                      <Typography variant="subtitle2">
                        ¥{(
                          selections.selected_menus.reduce((sum, menu) => sum + menu.price, 0) +
                          selections.selected_options.reduce((sum, option) => sum + option.price, 0)
                        ).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">所要時間</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selections.selected_menus.reduce((sum, menu) => sum + menu.duration, 0) +
                         selections.selected_options.reduce((sum, option) => sum + option.duration, 0)}分
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                
                {selections.selected_datetime && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        希望日時
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selections.selected_datetime).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })} {new Date(selections.selected_datetime).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Paper>
            )}

            {/* 送信ボタン */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: getActiveConfig()?.basic_info.theme_color,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
                disabled={!isFormValid()}
                onClick={handleSubmit}
              >
                予約を確定する
              </Button>
              
              {!isFormValid() && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  必須項目をすべて入力してください
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Container>
      
      {/* 画像ポップアップダイアログ */}
      <Dialog
        open={imagePopup.open}
        onClose={handleCloseImagePopup}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {imagePopup.menuName} - 詳細画像
            </Typography>
            <IconButton onClick={handleCloseImagePopup} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {imagePopup.imageUrl && (
            <Box sx={{ textAlign: 'center' }}>
              {imagePopup.imageName?.endsWith('.pdf') ? (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    PDF ファイル
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {imagePopup.imageName}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => window.open(imagePopup.imageUrl, '_blank')}
                  >
                    PDFを開く
                  </Button>
                </Box>
              ) : (
                <img
                  src={imagePopup.imageUrl}
                  alt={imagePopup.imageName || '画像'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomerForm;
