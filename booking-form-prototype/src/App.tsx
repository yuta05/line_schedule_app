import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import FormManagement from './pages/FormManagement';
import FormPreview from './pages/FormPreview';
import CustomerForm from './pages/CustomerForm';
import ServiceAdmin from './components/ServiceAdmin/ServiceAdmin';
import StoreAdmin from './components/ServiceAdmin/StoreAdmin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#13ca5e',
    },
    secondary: {
      main: '#e91e63',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* サービス管理者向けルート */}
          <Route path="/admin" element={<ServiceAdmin />} />
          <Route path="/admin/:storeId" element={<StoreAdmin />} />
          
          {/* 店舗管理者向けルート */}
          <Route path="/:storeId/admin" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/:storeId/admin/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/:storeId/admin/settings" element={<AppLayout><div>設定（準備中）</div></AppLayout>} />
          
          {/* フォーム管理（フルスクリーン） */}
          <Route path="/form-management/:formId" element={<FormManagement />} />
          <Route path="/forms/:formId" element={<FormManagement />} />
          <Route path="/forms/:formId/preview" element={<FormPreview />} />
          
          {/* 顧客向けルート（レイアウトなし） */}
          <Route path="/customer/:formId" element={<CustomerForm />} />
          <Route path="/form/:formId" element={<CustomerForm />} />
          
          {/* ルート */}
          <Route path="/" element={<ServiceAdmin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
