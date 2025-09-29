import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  FormHelperText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import type { Form, MenuCategory, MenuItem, MenuOption } from '../../types/form';
import { ImageService } from '../../services/imageService';
import { LocalStorageService } from '../../services/localStorageService';

interface MenuStructureEditorProps {
  form: Form;
  onUpdate: (updatedForm: Form) => void;
}

interface MenuItemDialogProps {
  open: boolean;
  menuItem?: MenuItem;
  categoryId: string;
  onClose: () => void;
  onSave: (menuItem: MenuItem) => void;
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({
  open,
  menuItem,
  categoryId,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(menuItem?.name || '');
  const [price, setPrice] = useState(menuItem?.price.toString() || '');
  const [duration, setDuration] = useState(menuItem?.duration.toString() || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [imageUrl, setImageUrl] = useState(menuItem?.image_url || '');
  const [imageName, setImageName] = useState(menuItem?.image_name || '');
  const [genderFilter, setGenderFilter] = useState(menuItem?.gender_filter || 'both');
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setPrice(menuItem.price.toString());
      setDuration(menuItem.duration.toString());
      setDescription(menuItem.description || '');
      setImageUrl(menuItem.image_url || '');
      setImageName(menuItem.image_name || '');
      setGenderFilter(menuItem.gender_filter || 'both');
    } else {
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      setImageUrl('');
      setImageName('');
      setGenderFilter('both');
    }
    setUploadError('');
  }, [menuItem]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError('');

    try {
      const validation = ImageService.validateFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'ファイルが無効です');
        return;
      }

      const result = await ImageService.convertToDataUrl(file);
      setImageUrl(result.url);
      setImageName(result.name);
    } catch (error) {
      setUploadError('画像のアップロードに失敗しました');
      console.error('Image upload error:', error);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageName('');
    setUploadError('');
  };

  const handleSave = () => {
    const newMenuItem: MenuItem = {
      id: menuItem?.id || `menu_${Date.now()}`,
      name,
      price: parseInt(price) || 0,
      duration: parseInt(duration) || 0,
      description: description || undefined,
      category_id: categoryId,
      image_url: imageUrl || undefined,
      image_name: imageName || undefined,
      gender_filter: genderFilter as 'male' | 'female' | 'both'
    };
    onSave(newMenuItem);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {menuItem ? 'メニュー編集' : '新規メニュー追加'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="メニュー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            <TextField
              fullWidth
              label="料金（円）"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="所要時間（分）"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              variant="outlined"
            />
          </Box>
          <TextField
            fullWidth
            label="説明（オプション）"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
          />
          
          {/* 画像アップロード */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              メニュー画像（オプション）
            </Typography>
            
            {imageUrl ? (
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'grey.300' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {imageName?.endsWith('.pdf') ? (
                    <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  ) : (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="プレビュー"
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300'
                      }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {imageName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      画像がアップロードされました
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={handleRemoveImage}
                    size="small"
                    color="error"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>
            ) : (
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ p: 2, border: '2px dashed', borderColor: 'grey.300' }}
              >
                画像をアップロード（PNG, JPEG, PDF）
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                />
              </Button>
            )}
            
            {uploadError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {uploadError}
              </Alert>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              顧客フォームでメニューの詳細情報として表示されます（最大5MB）
            </Typography>
          </Box>

          {/* 性別フィルター */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>性別フィルター</InputLabel>
            <Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              label="性別フィルター"
            >
              <MuiMenuItem value="both">すべて</MuiMenuItem>
              <MuiMenuItem value="male">男性のみ</MuiMenuItem>
              <MuiMenuItem value="female">女性のみ</MuiMenuItem>
            </Select>
            <FormHelperText>
              このメニューを表示する性別を選択してください
            </FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MenuStructureEditor: React.FC<MenuStructureEditorProps> = ({ form, onUpdate }) => {
  // 下書きがある場合は下書き設定を、ない場合は公開設定を表示
  const currentConfig = form.draft_config || form.config;
  const [categories, setCategories] = useState<MenuCategory[]>(currentConfig.menu_structure.categories);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string>('');
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

    // 変更チェック
  const hasChanged = useMemo(() => {
    return JSON.stringify(categories) !== JSON.stringify(currentConfig.menu_structure.categories);
  }, [categories, currentConfig]);

  const handleSave = () => {
    const updatedConfig = {
      ...currentConfig,
      menu_structure: {
        ...currentConfig.menu_structure,
        categories: categories
      }
    };
    
    // 下書きとして保存
    LocalStorageService.saveDraft(form.id, updatedConfig);
    
    // 親コンポーネントに通知（フォーム状態更新のため）
    const updatedForm: Form = {
      ...form,
      draft_config: updatedConfig,
      updated_at: new Date().toISOString(),
      draft_status: 'draft'
    };
    onUpdate(updatedForm);
  };

  const handlePublish = () => {
    if (window.confirm('下書きを公開しますか？この操作により、変更内容が本番フォームに反映されます。')) {
      LocalStorageService.publishDraft(form.id);
      
      // 親コンポーネントに通知
      const updatedForm: Form = {
        ...form,
        config: form.draft_config!,
        draft_config: undefined,
        draft_status: 'none',
        updated_at: new Date().toISOString(),
        last_published_at: new Date().toISOString()
      };
      onUpdate(updatedForm);
    }
  };

  const handleDiscardDraft = () => {
    if (window.confirm('下書きを破棄しますか？未保存の変更内容は失われます。')) {
      LocalStorageService.discardDraft(form.id);
      setCategories(form.config.menu_structure.categories);
      
      // 親コンポーネントに通知
      const updatedForm: Form = {
        ...form,
        draft_config: undefined,
        draft_status: 'none',
        updated_at: new Date().toISOString()
      };
      onUpdate(updatedForm);
    }
  };

  const handleReset = () => {
    setCategories(currentConfig.menu_structure.categories);
    setEditingCategoryId('');
    setEditingCategoryName('');
  };

  const handleStartEditingCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(currentName);
  };

  const handleSaveCategoryName = () => {
    if (editingCategoryName.trim() && editingCategoryId) {
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === editingCategoryId
            ? { ...category, display_name: editingCategoryName.trim() }
            : category
        )
      );
    }
    setEditingCategoryId('');
    setEditingCategoryName('');
  };

  const handleCancelEditingCategory = () => {
    setEditingCategoryId('');
    setEditingCategoryName('');
  };

  const handleUpdateCategoryGender = (categoryId: string, genderCondition: 'male' | 'female' | 'all') => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? { ...category, gender_condition: genderCondition }
          : category
      )
    );
  };

  const handleAddCategory = () => {
    const newCategoryId = `category_${Date.now()}`;
    const newCategory: MenuCategory = {
      id: newCategoryId,
      name: '新しいカテゴリー',
      display_name: '◆新しいカテゴリー◆',
      items: [],
      menus: [],
      options: [],
      selection_mode: 'single',
      gender_condition: 'all'
    };
    
    setCategories(prevCategories => [...prevCategories, newCategory]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('このカテゴリーを削除しますか？カテゴリー内の全てのメニューも削除されます。')) {
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
    }
  };

  const handleAddMenuItem = (categoryId: string) => {
    setSelectedMenuItem(undefined);
    setSelectedCategoryId(categoryId);
    setMenuDialogOpen(true);
  };

  const handleEditMenuItem = (categoryId: string, menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setSelectedCategoryId(categoryId);
    setMenuDialogOpen(true);
  };

  const handleSaveMenuItem = (menuItem: MenuItem) => {
    setCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === selectedCategoryId) {
          const isOption = selectedMenuItem?.id ? 
            category.options?.some(opt => opt.id === selectedMenuItem.id) :
            false;
          
          if (isOption) {
            // オプションメニューの更新
            return {
              ...category,
              options: selectedMenuItem?.id ?
                category.options?.map(opt => opt.id === selectedMenuItem.id ? menuItem : opt) :
                [...(category.options || []), menuItem]
            };
          } else {
            // メインメニューの更新
            return {
              ...category,
              menus: selectedMenuItem?.id ?
                category.menus.map(menu => menu.id === selectedMenuItem.id ? menuItem : menu) :
                [...category.menus, menuItem]
            };
          }
        }
        return category;
      })
    );
  };

  const handleDeleteMenuItem = (categoryId: string, menuItemId: string) => {
    setCategories(prevCategories =>
      prevCategories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            menus: category.menus.filter(menu => menu.id !== menuItemId),
            options: category.options?.filter(opt => opt.id !== menuItemId) || []
          };
        }
        return category;
      })
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* 下書き状態の表示 */}
      {form.draft_status === 'draft' && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleDiscardDraft} sx={{ mr: 1 }}>
                下書き破棄
              </Button>
              <Button color="inherit" size="small" onClick={handlePublish} variant="outlined">
                公開
              </Button>
            </Box>
          }
        >
          下書きが保存されています。「公開」をクリックすると本番フォームに反映されます。
        </Alert>
      )}

      {hasChanged && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleReset} sx={{ mr: 1 }}>
                リセット
              </Button>
              <Button color="inherit" size="small" onClick={handleSave} variant="outlined">
                下書き保存
              </Button>
            </Box>
          }
        >
          変更があります。下書きとして保存してください。
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* メニューカテゴリー */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                メニューカテゴリー
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
                sx={{ bgcolor: form.config.basic_info.theme_color }}
              >
                カテゴリー追加
              </Button>
            </Box>

            {categories.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  まだカテゴリーがありません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  「カテゴリー追加」ボタンから最初のカテゴリーを作成してください
                </Typography>
              </Box>
            ) : (
              categories.map((category, index) => (
              <Accordion key={category.id} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <DragIcon sx={{ mr: 1, color: 'grey.400' }} />
                    {editingCategoryId === category.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                        <TextField
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ flexGrow: 1, mr: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveCategoryName();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveCategoryName();
                          }}
                          sx={{ mr: 0.5 }}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEditingCategory();
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ flexGrow: 1, cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditingCategory(category.id, category.display_name);
                          }}
                        >
                          {category.display_name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditingCategory(category.id, category.display_name);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          sx={{ mr: 1, color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                    <Chip 
                      size="small" 
                      label={`${category.menus.length}メニュー + ${category.options?.length || 0}オプション`}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {/* カテゴリー設定 */}
                    {currentConfig.gender_selection?.enabled && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                          カテゴリー設定
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>表示条件（性別）</InputLabel>
                          <Select
                            value={category.gender_condition || 'all'}
                            onChange={(e) => handleUpdateCategoryGender(category.id, e.target.value as 'male' | 'female' | 'all')}
                            label="表示条件（性別）"
                          >
                            <MuiMenuItem value="all">全性別に表示</MuiMenuItem>
                            <MuiMenuItem value="male">男性のみ表示</MuiMenuItem>
                            <MuiMenuItem value="female">女性のみ表示</MuiMenuItem>
                          </Select>
                          <FormHelperText>
                            このカテゴリーを表示する性別を選択してください
                          </FormHelperText>
                        </FormControl>
                      </Box>
                    )}

                    {/* メインメニュー */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2">
                          メインメニュー
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddMenuItem(category.id)}
                        >
                          追加
                        </Button>
                      </Box>
                      <List dense>
                        {category.menus.map((menu) => (
                          <ListItem key={menu.id} divider>
                            <ListItemText
                              primary={menu.name}
                              secondary={`¥${menu.price.toLocaleString()} • ${menu.duration}分${menu.description ? ` • ${menu.description}` : ''}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleEditMenuItem(category.id, menu)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteMenuItem(category.id, menu.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* オプションメニュー */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2">
                          オプションメニュー
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddMenuItem(category.id)}
                        >
                          追加
                        </Button>
                      </Box>
                      <List dense>
                        {category.options?.map((option) => (
                          <ListItem key={option.id} divider>
                            <ListItemText
                              primary={option.name}
                              secondary={`¥${option.price.toLocaleString()} • ${option.duration}分${option.description ? ` • ${option.description}` : ''}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleEditMenuItem(category.id, option)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteMenuItem(category.id, option.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
              ))
            )}
          </CardContent>
        </Card>
      </Box>

      <MenuItemDialog
        open={menuDialogOpen}
        menuItem={selectedMenuItem}
        categoryId={selectedCategoryId}
        onClose={() => setMenuDialogOpen(false)}
        onSave={handleSaveMenuItem}
      />
    </Box>
  );
};

export default MenuStructureEditor;
