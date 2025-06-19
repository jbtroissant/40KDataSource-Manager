import React, { createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { useThemeMode } from './hooks/useThemeMode';
import HomePage from './components/HomePage';
import FactionView from './components/FactionView';
import DatasheetEditor from './components/DatasheetEditor/DatasheetEditor';
import clearBackground from './assets/images/clearBackground.png';
import darkBackground from './assets/images/darkBackground.jpg';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { VersionService } from './services/versionService';
import { DatasourceProvider } from './contexts/DatasourceContext';
import { LegendsProvider } from './contexts/LegendsContext';

export const ThemeContext = createContext({
  mode: 'dark' as 'light' | 'dark',
  toggleTheme: () => {},
});

function App() {
  const { mode, toggleMode } = useThemeMode();

  // Vérifier la version au démarrage
  useEffect(() => {
    const initializeApp = async () => {
      await VersionService.checkVersion();
    };
    initializeApp();
  }, []);

  const getTheme = () => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1ba2bd' : '#FFD700',
        contrastText: '#fff',
      },
      background: {
        default: 'transparent',
        paper: mode === 'light' ? 'rgba(245, 245, 245, 0.9)' : 'rgba(30, 30, 30, 0.9)',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            color: mode === 'light' ? '#fff' : '#000',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme: toggleMode }}>
      <ThemeProvider theme={getTheme()}>
        <CssBaseline />
        <DatasourceProvider>
          <LegendsProvider>
            <SnackbarProvider>
              <Box
                sx={{
                  minHeight: '100vh',
                  width: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${mode === 'light' ? clearBackground : darkBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1,
                  },
                }}
              >
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/faction/:factionId" element={<FactionView />} />
                    <Route path="/editor/:factionId/:datasheetId" element={<DatasheetEditor />} />
                  </Routes>
                </Router>
              </Box>
            </SnackbarProvider>
          </LegendsProvider>
        </DatasourceProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App; 