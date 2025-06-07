import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, useTheme, useMediaQuery, Tooltip, Tabs, Tab } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AppLayout from '../AppLayout';

interface ScreenLayoutProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  pinLeft?: boolean;
  pinRight?: boolean;
  leftWidth?: number | string;
  rightWidth?: number | string;
  title?: React.ReactNode;
  leftAction?: React.ReactNode;
  tabsLabels?: [string, string];
  topContent?: React.ReactNode;
  selectedTab?: number;
  onTabChange?: (tab: number) => void;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  leftContent,
  rightContent,
  children,
  pinLeft = false,
  pinRight = false,
  leftWidth = 320,
  rightWidth = 320,
  title = 'Strategium',
  leftAction,
  tabsLabels,
  topContent,
  selectedTab,
  onTabChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [leftOpen, setLeftOpen] = useState(pinLeft);
  const [rightOpen, setRightOpen] = useState(pinRight);
  const [tab, setTab] = useState(selectedTab ?? 0);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof selectedTab === 'number' && selectedTab !== tab) {
      setTab(selectedTab);
    }
  }, [selectedTab]);

  // Responsive: colonnes fermées par défaut sur mobile
  React.useEffect(() => {
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    } else {
      setLeftOpen(pinLeft);
      setRightOpen(pinRight);
    }
  }, [isMobile, pinLeft, pinRight]);

  // Mode mobile portrait : affichage en onglets
  if (isMobile && isPortrait) {
    return (
      <AppLayout title={title} leftAction={leftAction}>
        <Box sx={{ 
            width: '100vw', 
            bgcolor: 'transparent', 
            minHeight: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
            height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
            display: 'flex', 
            flexDirection: 'column', 
          }}>
          {topContent}
          {tabsLabels && (
            <Tabs
              value={typeof selectedTab === 'number' ? selectedTab : tab}
              onChange={(_, v) => {
                if (onTabChange) onTabChange(v);
                else setTab(v);
              }}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
            >
              <Tab label={tabsLabels[0]} />
              <Tab label={tabsLabels[1]} />
            </Tabs>
          )}
          {tabsLabels ? (
            <>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  display: (typeof selectedTab === 'number' ? selectedTab : tab) === 0 ? 'flex' : 'none',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  height: '100%',
                }}
              >
                {leftContent}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  display: (typeof selectedTab === 'number' ? selectedTab : tab) === 1 ? 'flex' : 'none',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  height: '100%',
                }}
              >
                {rightContent}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              {rightContent}
            </Box>
          )}
        </Box>
      </AppLayout>
    );
  }

  // Mode mobile paysage : uniquement le contenu central
  if (isMobile && !isPortrait) {
    return (
      <AppLayout title={title} leftAction={leftAction}>
        <Box sx={{ width: '100vw', bgcolor: 'transparent', minHeight: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)' }} />
      </AppLayout>
    );
  }

  // Mode split habituel
  return (
    <AppLayout title={title} leftAction={leftAction}>
      <Box sx={{ height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: 'transparent', position: 'relative' }}>
        {/* Corps principal */}
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
          {/* Colonne gauche */}
          {(leftContent && leftOpen) && (
            <Paper
              elevation={0}
              sx={{
                width: { xs: '80vw', sm: leftWidth },
                minWidth: 0,
                maxWidth: 500,
                height: 'calc(100% - 16px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                left: 0,
                top: 8,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                zIndex: 2,
                transition: 'width 0.2s',
              }}
            >
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 1 }}>
                {/* Bouton pour fermer le volet */}
                <Tooltip title={'Fermer'}>
                  <IconButton 
                    sx={{
                      border: '1px solid',
                      width: 32,
                      height: 32,
                      borderColor: 'divider',
                    }} 
                    size="small" onClick={() => setLeftOpen(false)}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>{leftContent}</Box>
            </Paper>
          )}
          {/* Bouton flottant pour rouvrir le volet gauche */}
          {leftContent && !leftOpen && (
            <IconButton
              size="small"
              onClick={() => setLeftOpen(true)}
              sx={{
                position: 'absolute',
                left: 0,
                top: 8,
                zIndex: 20,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                borderRadius: '0 16px 16px 0',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
                '&:hover': { bgcolor: 'transparent' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
          {/* Zone centrale */}
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', height: 'calc(100% - 16px)', marginTop: '8px' }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              px: 2,
            }}>
              <Box sx={{
                width: {
                  xs: '100vw',
                  sm: `calc(100vw - ${leftWidth}px - ${rightWidth}px)`
                },
                maxWidth: 1080,
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflowX: 'hidden',
              }}>
                {children}
              </Box>
            </Box>
          </Box>
          {/* Colonne droite */}
          {(rightContent && rightOpen) && (
            <Paper
              elevation={0}
              sx={{
                width: { xs: '80vw', sm: rightWidth },
                minWidth: 0,
                maxWidth: 500,
                height: 'calc(100% - 16px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                right: 0,
                top: 8,
                borderLeft: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                zIndex: 2,
                transition: 'width 0.2s',
              }}
            >
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', gap: 1 }}>
                {/* Bouton pour fermer le volet */}
                <Tooltip title={'Fermer'}>
                  <IconButton 
                  sx={{
                    border: '1px solid',
                    width: 32,
                    height: 32,
                    borderColor: 'divider',
                   }} 
                  size="small" onClick={() => setRightOpen(false)}>
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>{rightContent}</Box>
            </Paper>
          )}
          {/* Bouton flottant pour rouvrir le volet droit */}
          {rightContent && !rightOpen && (
            <IconButton
              size="small"
              onClick={() => setRightOpen(true)}
              sx={{
                position: 'absolute',
                right: 0,
                top: 8,
                zIndex: 20,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                borderRadius: '16px 0 0 16px',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
                '&:hover': { bgcolor: 'transparent' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
};

export default ScreenLayout; 