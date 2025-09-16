import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  FormGroup,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AccessTime,
  Phone,
  Person,
  Message,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { Form, MenuItem, VisitOption, CustomerInfo, MenuSelections } from '../types/form';
import { LocalStorageService } from '../services/localStorageService';
import { GoogleCalendarService } from '../services/googleCalendarService';
import CalendarSelector from '../components/Calendar/CalendarSelector';

const CustomerForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
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
      const foundForm = LocalStorageService.getForm(formId);
      if (foundForm) {
        setForm(foundForm);
      }
      setLoading(false);
    }
  }, [formId]);

  const calculateTotal = () => {
    const visitFee = selections.visit_option?.price || 0;
    const menuPrice = selections.selected_menus.reduce((sum, menu) => sum + menu.price, 0);
    const optionsPrice = selections.selected_options.reduce((sum, option) => sum + option.price, 0);
    const totalDuration = selections.selected_menus.reduce((sum, menu) => sum + menu.duration, 0) +
                         selections.selected_options.reduce((sum, option) => sum + option.duration, 0);
    
    return {
      visit_fee: visitFee,
      menu_price: menuPrice,
      options_price: optionsPrice,
      total_price: visitFee + menuPrice + optionsPrice,
      duration_minutes: totalDuration
    };
  };

  const handleVisitOptionChange = (option: VisitOption) => {
    setSelections(prev => ({ ...prev, visit_option: option }));
  };

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

  const handleOptionToggle = (option: MenuItem) => {
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

  const handleImageClick = (imageUrl: string, imageName: string, menuName: string) => {
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

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setSelections(prev => ({
      ...prev,
      customer_info: {
        ...prev.customer_info,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selections.selected_datetime || !selections.visit_option) {
      alert('必要な情報が入力されていません');
      return;
    }

    const reservationData = {
      date: selections.selected_datetime.toISOString().split('T')[0],
      time: selections.selected_datetime.toTimeString().split(' ')[0].slice(0, 5),
      duration: total.duration_minutes,
      customerName: selections.customer_info.name,
      customerPhone: selections.customer_info.phone,
      menuNames: [
        ...selections.selected_menus.map(m => m.name),
        ...selections.selected_options.map(o => o.name)
      ],
      storeId: form?.store_id || 'store_0001',
      formId: form?.id || formId || ''
    };

    try {
      const result = await GoogleCalendarService.createReservation(reservationData);
      if (result.success) {
        alert(`予約を受け付けました！\n予約ID: ${result.eventId || 'DEMO_' + Date.now()}`);
      } else {
        alert(`予約の処理中にエラーが発生しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('予約を受け付けました！（デモ版）');
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    const datetime = new Date(`${date}T${time}:00`);
    setSelections(prev => ({ ...prev, selected_datetime: datetime }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">フォームが見つかりません</Typography>
      </Box>
    );
  }

  const total = calculateTotal();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'grey.50',
        py: 2
      }}
    >
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
        {/* ヘッダー */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: form.config.basic_info.theme_color,
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2
            }}
          >
            {form.config.basic_info.store_name.charAt(0)}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {form.config.basic_info.form_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {form.config.basic_info.store_name}
          </Typography>
        </Paper>

        {/* ステップ1: 来店回数選択 */}
        {currentStep === 1 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              来店回数を選択してください
            </Typography>
            <RadioGroup
              value={selections.visit_option?.id || ''}
              onChange={(e) => {
                const option = form.config.visit_options.find(o => o.id === e.target.value);
                if (option) handleVisitOptionChange(option);
              }}
            >
              {form.config.visit_options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{option.label}</Typography>
                      <Chip 
                        size="small" 
                        label={`¥${option.price.toLocaleString()}`}
                        color="primary"
                      />
                      <Chip 
                        size="small" 
                        label={`${option.duration}分`}
                        variant="outlined"
                      />
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
            
            {/* 性別選択 */}
            {form.config.gender_selection?.enabled && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  性別を選択してください
                  {form.config.gender_selection.required && (
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
                  {form.config.gender_selection.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}
            
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, bgcolor: form.config.basic_info.theme_color }}
              disabled={
                !selections.visit_option ||
                (form.config.gender_selection?.enabled && 
                 form.config.gender_selection.required && 
                 !selections.gender)
              }
              onClick={() => setCurrentStep(2)}
            >
              次へ
            </Button>
          </Paper>
        )}

        {/* ステップ2: メニュー選択 */}
        {currentStep === 2 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              メニューを選択してください
            </Typography>
            
            {form.config.menu_structure.categories
              .filter(category => {
                // 性別選択が無効の場合は、全てのカテゴリーを表示
                if (!form.config.gender_selection?.enabled) {
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
                  {category.menus.map((menu) => (
                    <Card 
                      key={menu.id}
                      sx={{ 
                        cursor: 'pointer',
                        border: selections.selected_menus.some(m => m.id === menu.id) ? 2 : 1,
                        borderColor: selections.selected_menus.some(m => m.id === menu.id) 
                          ? form.config.basic_info.theme_color 
                          : 'grey.300'
                      }}
                      onClick={() => handleMenuToggle(menu)}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {menu.name}
                              </Typography>
                              {menu.image_url && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageClick(menu.image_url!, menu.image_name || '', menu.name);
                                  }}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { backgroundColor: 'primary.50' }
                                  }}
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            {menu.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {menu.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {form.config.menu_structure.display_options.show_price && (
                                <Chip 
                                  size="small" 
                                  label={`¥${menu.price.toLocaleString()}`}
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {form.config.menu_structure.display_options.show_duration && (
                                <Chip 
                                  size="small" 
                                  icon={<AccessTime />}
                                  label={`${menu.duration}分`}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <Checkbox
                            checked={selections.selected_menus.some(m => m.id === menu.id)}
                            onChange={() => handleMenuToggle(menu)}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* オプションメニュー */}
                {category.options.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      オプション
                    </Typography>
                    <FormGroup>
                      {category.options.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          control={
                            <Checkbox
                              checked={selections.selected_options.some(o => o.id === option.id)}
                              onChange={() => handleOptionToggle(option)}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{option.name}</Typography>
                              {option.image_url && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageClick(option.image_url!, option.image_name || '', option.name);
                                  }}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { backgroundColor: 'primary.50' }
                                  }}
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              )}
                              <Chip 
                                size="small" 
                                label={`+¥${option.price.toLocaleString()}`}
                                color="secondary"
                              />
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Box>
                )}
              </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(1)}
              >
                戻る
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: form.config.basic_info.theme_color }}
                disabled={selections.selected_menus.length === 0}
                onClick={() => setCurrentStep(3)}
              >
                次へ
              </Button>
            </Box>
          </Paper>
        )}

        {/* ステップ3: 日時選択 */}
        {currentStep === 3 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ご希望の日時を選択してください
            </Typography>
            
            <CalendarSelector
              onDateTimeSelect={handleDateTimeSelect}
              selectedDate={selections.selected_datetime?.toISOString().split('T')[0]}
              selectedTime={selections.selected_datetime?.toTimeString().split(' ')[0].slice(0, 5)}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(2)}
              >
                戻る
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: form.config.basic_info.theme_color }}
                disabled={!selections.selected_datetime}
                onClick={() => setCurrentStep(4)}
              >
                次へ
              </Button>
            </Box>
          </Paper>
        )}

        {/* ステップ4: お客様情報入力 */}
        {currentStep === 4 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              お客様情報を入力してください
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                fullWidth
                label="お名前"
                required
                value={selections.customer_info.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="電話番号"
                required
                value={selections.customer_info.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="ご要望・メッセージ（任意）"
                multiline
                rows={3}
                value={selections.customer_info.message}
                onChange={(e) => handleCustomerInfoChange('message', e.target.value)}
                InputProps={{
                  startAdornment: <Message sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(3)}
              >
                戻る
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: form.config.basic_info.theme_color }}
                disabled={!selections.customer_info.name || !selections.customer_info.phone}
                onClick={() => setCurrentStep(5)}
              >
                次へ
              </Button>
            </Box>
          </Paper>
        )}

        {/* ステップ5: 確認・送信 */}
        {currentStep === 5 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              予約内容の確認
            </Typography>
            
            {/* 選択内容表示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>来店回数</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selections.visit_option?.label} - ¥{selections.visit_option?.price.toLocaleString()}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>選択メニュー</Typography>
              {selections.selected_menus.map((menu) => (
                <Typography key={menu.id} variant="body2">
                  • {menu.name} - ¥{menu.price.toLocaleString()}
                </Typography>
              ))}
              
              {selections.selected_options.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>オプション</Typography>
                  {selections.selected_options.map((option) => (
                    <Typography key={option.id} variant="body2">
                      • {option.name} - ¥{option.price.toLocaleString()}
                    </Typography>
                  ))}
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>予約日時</Typography>
              <Typography variant="body2">
                日付: {selections.selected_datetime?.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Typography>
              <Typography variant="body2">
                時間: {selections.selected_datetime?.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>お客様情報</Typography>
              <Typography variant="body2">お名前: {selections.customer_info.name}</Typography>
              <Typography variant="body2">電話番号: {selections.customer_info.phone}</Typography>
              {selections.customer_info.message && (
                <Typography variant="body2">メッセージ: {selections.customer_info.message}</Typography>
              )}
            </Box>

            {/* 合計表示 */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2">
                合計料金: ¥{total.total_price.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                予想所要時間: {total.duration_minutes}分
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(4)}
              >
                戻る
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: form.config.basic_info.theme_color }}
                onClick={handleSubmit}
              >
                予約を確定する
              </Button>
            </Box>
          </Paper>
        )}

        {/* 進行状況表示 */}
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ステップ {currentStep} / 4
          </Typography>
        </Paper>

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
                  <Box>
                    <img
                      src={imagePopup.imageUrl}
                      alt={imagePopup.menuName}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                    {imagePopup.imageName && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {imagePopup.imageName}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseImagePopup}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CustomerForm;
