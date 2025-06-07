import { createTheme, ThemeOptions } from '@mui/material/styles';

const commonStyles: Partial<ThemeOptions> = {
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(255, 215, 0, 0.5)',
          },
        },
      },
    },
  },
};

const cardBaseStyles = {
  borderRadius: 16,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
};

export const lightTheme = createTheme({
  ...commonStyles,
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#c9c7c7',
      secondary: '#546e7a',
    },
  },
  components: {
    ...commonStyles.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...cardBaseStyles,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          color: '#2c3e50',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...commonStyles,
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff80ab',
      dark: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...commonStyles.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...cardBaseStyles,
          background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
          color: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        },
      },
    },
  },
}); 