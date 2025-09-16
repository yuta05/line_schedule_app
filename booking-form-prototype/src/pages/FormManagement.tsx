import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
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
    setForm(updatedForm);
    setSaveStatus('saving');
    
    try {
      // ドラフトとして保存
      LocalStorageService.saveDraft(updatedForm.id, updatedForm.draft_config || updatedForm.config);
      setSaveStatus('saved');
      setShowAlert(true);
    } catch {
      setSaveStatus('error');
      setShowAlert(true);
    }
  };

  const handleSave = () => {
    if (form) {
      handleFormUpdate(form);
    }
  };

  const handlePreview = () => {
    if (formId) {
      window.open(`/preview/${formId}`, '_blank');
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setSaveStatus('idle');
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
          </Typography>
          <Button 
            color="inherit" 
            onClick={handlePreview}
            sx={{ mr: 2 }}
          >
            プレビュー
          </Button>
          <Button 
            color="inherit" 
            variant="outlined"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
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
          {saveStatus === 'saved' ? 'フォームを保存しました' : '保存に失敗しました'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormManagement;
