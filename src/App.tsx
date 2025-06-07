import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { useThemeMode } from './hooks/useThemeMode';
import { Army } from './types/army';
import HomePage from './components/HomePage';
import ArmyBuilder from './components/army-builder/ArmyBuilder';
import clearBackground from './assets/images/clearBackground.png';
import darkBackground from './assets/images/darkBackground.jpg';
import { Datasheet } from './types/datasheet';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { VersionService } from './services/versionService';
import { DatasourceProvider } from './contexts/DatasourceContext';

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
      },
      background: {
        default: 'transparent',
        paper: mode === 'light' ? 'rgba(245, 245, 245, 0.9)' : 'rgba(30, 30, 30, 0.9)',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#2196f3' : '#000000',
            '& .MuiSvgIcon-root': {
              color: mode === 'light' ? '#2196f3' : '#000000',
            },
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
                  <Route path="/army-builder/:armyId" element={<ArmyBuilder />} />
                </Routes>
              </Router>
            </Box>
          </SnackbarProvider>
        </DatasourceProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App; 