import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { ArrowBack, Visibility, Publish, Delete } from '@mui/icons-material';
import type { Form } from '../types/form';
import { LocalStorageService } from '../services/localStorageService';
import BasicInfoEditor from '../components/FormManagement/BasicInfoEditor';
import MenuStructureEditor from '../components/FormManagement/MenuStructureEditor';
import BusinessRulesEditor from '../components/FormManagement/BusinessRulesEditor';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `form-tab-${index}`,
    'aria-controls': `form-tabpanel-${index}`,
  };
}

const FormManagement: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [saveRequestTrigger, setSaveRequestTrigger] = useState(0);

  useEffect(() => {
    if (formId) {
      const foundForm = LocalStorageService.getForm(formId);
      if (foundForm) {
        setForm(foundForm);
      } else {
        // フォームが見つからない場合はダッシュボードに戻る
        navigate('/dashboard');
      }
    }
  }, [formId, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormUpdate = (updatedForm: Form) => {
    // エディタから変更があった場合のみフォーム状態を更新
    setForm(updatedForm);
  };

  const handleSave = () => {
    if (form && form.draft_config) {
      setSaveStatus('saving');
      
      // 各エディタに保存要求を送信
      setSaveRequestTrigger(prev => prev + 1);
      
      try {
        // ドラフト設定を保存
        LocalStorageService.saveDraft(form.id, form.draft_config);
        
        // フォーム状態を更新
        const updatedForm = LocalStorageService.getForm(form.id);
        if (updatedForm) {
          setForm(updatedForm);
        }
        
        setSaveStatus('saved');
        setAlertMessage('変更をドラフトとして保存しました');
        setShowAlert(true);
      } catch {
        setSaveStatus('error');
        setAlertMessage('保存に失敗しました');
        setShowAlert(true);
      }
    }
  };

  const handlePreview = () => {
    if (formId) {
      // プレビューを開く前に現在のフォーム状態を確実に保存
      if (form) {
        const configToSave = form.draft_config || form.config;
        try {
          LocalStorageService.saveDraft(form.id, configToSave);
          // 少し待ってからプレビューを開く（保存が確実に完了するように）
          setTimeout(() => {
            window.open(`/forms/${formId}/preview`, '_blank');
          }, 100);
        } catch {
          // 保存に失敗してもプレビューは開く
          window.open(`/forms/${formId}/preview`, '_blank');
        }
      } else {
        window.open(`/forms/${formId}/preview`, '_blank');
      }
    }
  };

  const handlePublish = () => {
    if (formId && form) {
      setSaveStatus('saving');
      try {
        // ドラフトを公開（本番に反映）
        LocalStorageService.publishDraft(formId);
        // フォーム状態を更新
        const updatedForm = LocalStorageService.getForm(formId);
        if (updatedForm) {
          setForm(updatedForm);
        }
        setSaveStatus('saved');
        setAlertMessage('変更を公開しました');
        setShowAlert(true);
      } catch {
        setSaveStatus('error');
        setAlertMessage('公開に失敗しました');
        setShowAlert(true);
      }
    }
  };

  const handleDiscardDraft = () => {
    if (formId && form) {
      if (window.confirm('ドラフトの変更を破棄しますか？この操作は取り消せません。')) {
        try {
          LocalStorageService.discardDraft(formId);
          // フォーム状態を更新
          const updatedForm = LocalStorageService.getForm(formId);
          if (updatedForm) {
            setForm(updatedForm);
          }
          setAlertMessage('ドラフトの変更を破棄しました');
          setShowAlert(true);
        } catch {
          setSaveStatus('error');
          setAlertMessage('破棄に失敗しました');
          setShowAlert(true);
        }
      }
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setSaveStatus('idle');
    setAlertMessage('');
  };

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>フォームが見つかりません...</Typography>
      </Box>
    );
  }

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
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {form.config.basic_info.form_name} - 編集
            {form.draft_status === 'draft' && (
              <Chip 
                label="変更あり（未保存）" 
                size="small" 
                color="warning" 
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handlePreview}
            startIcon={<Visibility />}
            sx={{ mr: 2 }}
          >
            プレビュー
          </Button>
          {form.draft_status === 'draft' && (
            <>
              <Button 
                color="inherit" 
                variant="outlined"
                onClick={handlePublish}
                startIcon={<Publish />}
                sx={{ mr: 1 }}
                disabled={saveStatus === 'saving'}
              >
                公開
              </Button>
              <Button 
                color="inherit" 
                variant="text"
                onClick={handleDiscardDraft}
                startIcon={<Delete />}
                sx={{ mr: 2 }}
                size="small"
              >
                破棄
              </Button>
            </>
          )}
          <Button 
            color="inherit" 
            variant="outlined"
            onClick={handleSave}
            disabled={saveStatus === 'saving' || form.draft_status !== 'draft'}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* タブ */}
      <Paper sx={{ borderRadius: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="基本情報" {...a11yProps(0)} />
          <Tab label="メニュー構成" {...a11yProps(1)} />
          <Tab label="営業時間・ルール" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* タブコンテンツ */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <BasicInfoEditor 
            form={form} 
            onUpdate={handleFormUpdate}
            onSaveRequest={saveRequestTrigger}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <MenuStructureEditor 
            form={form} 
            onUpdate={handleFormUpdate}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <BusinessRulesEditor 
            form={form} 
            onUpdate={handleFormUpdate}
          />
        </TabPanel>
      </Box>

      {/* 保存状態のアラート */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={saveStatus === 'saved' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {alertMessage || (saveStatus === 'saved' ? 'フォームを保存しました' : '保存に失敗しました')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormManagement;
