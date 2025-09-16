import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import FormManagement from './pages/FormManagement';
import FormPreview from './pages/FormPreview';
import CustomerForm from './pages/CustomerForm';

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
          {/* 管理者向けルート（AppLayoutでラップ） */}
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><div>設定（準備中）</div></AppLayout>} />
          
          {/* フォーム管理（フルスクリーン） */}
          <Route path="/forms/:formId" element={<FormManagement />} />
          <Route path="/forms/:formId/preview" element={<FormPreview />} />
          
          {/* 顧客向けルート（レイアウトなし） */}
          <Route path="/form/:formId" element={<CustomerForm />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
