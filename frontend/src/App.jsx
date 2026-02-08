import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chapter1 from './pages/Chapter1';
import Chapter2 from './pages/Chapter2';
import Chapter3 from './pages/Chapter3';
import Chapter4 from './pages/Chapter4';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#64b5f6' },
    secondary: { main: '#ce93d8' },
    background: { default: '#0a1929', paper: '#132f4c' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(100, 181, 246, 0.12)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chapter1" element={<Chapter1 />} />
            <Route path="/chapter2" element={<Chapter2 />} />
            <Route path="/chapter3" element={<Chapter3 />} />
            <Route path="/chapter4" element={<Chapter4 />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
