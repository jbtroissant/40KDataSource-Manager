import React, { useState, useContext, useEffect, useCallback, cloneElement, useRef } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  useMediaQuery,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  ArrowForwardIos,
} from '@mui/icons-material';
import { ThemeContext } from '../App';
import unitExclusions from '../config/unitExclusions.json';
import { saveDatasourceBloc, loadDatasource } from '../utils/datasourceDb';
import { useSnackbar } from '../contexts/SnackbarContext';
import { APP_VERSION } from '../config';
import Switch from '@mui/material/Switch';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { DatasourceProvider } from '../contexts/DatasourceContext';
import CircularProgress from '@mui/material/CircularProgress';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();
  return (
    <Box sx={{ ml: 2 }}>
      <MuiSelect
        value={lang}
        onChange={e => setLang(e.target.value as 'fr' | 'en')}
        size="small"
        variant="outlined"
        sx={{ minWidth: 80, verticalAlign: 'middle' }}
      >
        <MuiMenuItem value="fr">
          <span role="img" aria-label="Français" style={{ marginRight: 8 }}>🇫🇷</span> FR
        </MuiMenuItem>
        <MuiMenuItem value="en">
          <span role="img" aria-label="English" style={{ marginRight: 8 }}>🇬🇧</span> EN
        </MuiMenuItem>
      </MuiSelect>
    </Box>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, title = 'Strategium', leftAction, rightAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [showLegends, setShowLegends] = useState(false);
  const [isLoadingDatasource, setIsLoadingDatasource] = useState(true);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleRefreshDatasource = useCallback(async () => {
    setIsLoadingDatasource(true);
    try {
      // Détection de iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      const endpoints = [
        // Factions principales d'abord
        'SM',  // Doit être chargé avant les sous-factions Space Marines
        'CSM',  // Doit être chargé avant les sous-factions Chaos
        'core',
        'AS',
        'AC',
        'AdM',
        'AE',
        'AoI',
        'AM',
        'CHBT',
        'CHBA',
        'CD',
        'QT',
        'CHDA',
        'DG',
        'DRU',
        'LGEC',
        'GK',
        'GSC',
        'QI',
        'NEC',
        'ORK',
        'CHSW',
        'TAU',
        'TS',
        'UN',
        'LoV',
        'WE',
        'TYR'
      ];

      const datasource: Record<string, any> = {};
      let errorOccurred = false;
      let loadedCount = 0;
      let errorCount = 0;
      let lastError: string | null = null;

      // Augmenter le timeout à 90 secondes pour iOS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), isIOS ? 90000 : 60000);

      for (const endpoint of endpoints) {
        const key = endpoint.replace('.json', '');
        // 1. Fichier traduit (racine)
        try {
          const translatedResp = await fetch(`https://raw.githubusercontent.com/jbtroissant/40KDataSource/refs/heads/main/${key}.translated.json`, {
            ...(isIOS ? {
              credentials: 'omit',
              mode: 'cors'
            } : {})
          });
          if (translatedResp.ok) {
            const data = await translatedResp.json();
            await saveDatasourceBloc(`${key}_translated`, data);
            datasource[`${key}_translated`] = data;
            loadedCount++;
          } else {
            errorOccurred = true;
            errorCount++;
            lastError = `Erreur HTTP ${translatedResp.status} pour ${key}_translated.json`;
          }
        } catch (error: any) {
          errorOccurred = true;
          errorCount++;
          lastError = `Erreur lors du chargement de ${key}_translated.json`;
        }

        // 2. Fichier flat EN
        try {
          const flatEnResp = await fetch(`https://raw.githubusercontent.com/jbtroissant/40KDataSource/refs/heads/main/en/${key}.flat.json`, {
            ...(isIOS ? {
              credentials: 'omit',
              mode: 'cors'
            } : {})
          });
          if (flatEnResp.ok) {
            const data = await flatEnResp.json();
            await saveDatasourceBloc(`${key}_flat_en`, data);
            datasource[`${key}_flat_en`] = data;
            loadedCount++;
          } else {
            errorOccurred = true;
            errorCount++;
            lastError = `Erreur HTTP ${flatEnResp.status} pour en/${key}_flat_en.json`;
          }
        } catch (error: any) {
          errorOccurred = true;
          errorCount++;
          lastError = `Erreur lors du chargement de en/${key}_flat_en.json`;
        }

        // 3. Fichier flat FR
        try {
          const flatFrResp = await fetch(`https://raw.githubusercontent.com/jbtroissant/40KDataSource/refs/heads/main/fr/${key}.flat.json`, {
            ...(isIOS ? {
              credentials: 'omit',
              mode: 'cors'
            } : {})
          });
          if (flatFrResp.ok) {
            const data = await flatFrResp.json();
            await saveDatasourceBloc(`${key}_flat_fr`, data);
            datasource[`${key}_flat_fr`] = data;
            loadedCount++;
          } else {
            errorOccurred = true;
            errorCount++;
            lastError = `Erreur HTTP ${flatFrResp.status} pour fr/${key}_flat_fr.json`;
          }
        } catch (error: any) {
          errorOccurred = true;
          errorCount++;
          lastError = `Erreur lors du chargement de fr/${key}_flat_fr.json`;
        }
      }

      clearTimeout(timeoutId);

      if (loadedCount === 0) {
        throw new Error(lastError || 'Impossible de charger les données. Vérifiez votre connexion.');
      }
      if (errorOccurred) {
      showSnackbar(`Chargement partiel : ${loadedCount} fichiers chargés, ${errorCount} erreurs`, 'warning');
    }
    } catch (error: any) {
      showSnackbar(error.message || 'Erreur inattendue lors de la mise à jour des données', 'error');
    } finally {
      handleClose();
      setIsLoadingDatasource(false);
    }
  }, [handleClose]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const cleanupDuplicateDatasheets = (datasource: Record<string, any>) => {
    
    // Appliquer les exclusions définies dans le fichier de configuration
    Object.entries(unitExclusions).forEach(([factionId, exclusions]) => {
      if (datasource[factionId] && datasource[factionId].datasheets) {
        const unitsToExclude = Object.values(exclusions).flat();
        
        datasource[factionId].datasheets = datasource[factionId].datasheets.filter((datasheet: any) => {
          const shouldKeep = !unitsToExclude.includes(datasheet.name);
          if (!shouldKeep) {
          }
          return shouldKeep;
        });
      }
    });
    
    // Trouver toutes les sous-factions
    const subfactions = Object.values(datasource).filter(faction => faction.is_subfaction === true);
    
    // Pour chaque sous-faction
    subfactions.forEach(subfaction => {
      if (!subfaction.parent_id || !subfaction.datasheets) {

        return;
      }
      
      // Trouver la faction parente
      const parentFaction = Object.values(datasource).find(faction => 
        faction.id === subfaction.parent_id
      );
      
      if (!parentFaction || !parentFaction.datasheets) {
       
        return;
      }
      
      
      
      // Récupérer les noms des datasheets de la sous-faction
      const subfactionDatasheets = subfaction.datasheets;

      // Créer un Set des noms de datasheets de la sous-faction pour une recherche plus efficace
      const subfactionDatasheetNames = new Set(subfactionDatasheets.map((d: any) => d.name.toLowerCase().trim()));
      
      // Filtrer les datasheets de la faction parente
      const filteredDatasheets = parentFaction.datasheets.filter((datasheet: any) => {
        const datasheetName = datasheet.name.toLowerCase().trim();
        const shouldRemove = subfactionDatasheetNames.has(datasheetName);
        if (shouldRemove) {
        }
        return !shouldRemove;
      });
      
      // Mettre à jour les datasheets de la faction parente
      parentFaction.datasheets = filteredDatasheets;
      

    });
    
    return datasource;
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type && (child.type as any).name === 'DatasheetList') {
      // @ts-ignore
      return cloneElement(child as any, { showLegends, setShowLegends });
    }
    return child;
  });

  // Vérifie la présence du datasource dans IndexedDB au montage, et le met à jour automatiquement s'il est vide
  useEffect(() => {
    async function checkDatasource() {
      const datasource = await loadDatasource();
      if (datasource && Object.keys(datasource).length > 0) {
        setIsLoadingDatasource(false);
      } else {
        setIsLoadingDatasource(true);
        await handleRefreshDatasource();
        setIsLoadingDatasource(false);
      }
    }
    checkDatasource();
  }, [handleRefreshDatasource]);

  return (
    <LanguageProvider>
      <DatasourceProvider>
        <Box 
          component="main"
          sx={{ 
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            bgcolor: 'background.default',
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.standard,
            }),
            overflow: 'hidden',
            margin: 0,
            padding: 0,
          }}
        >
          <AppBar 
            position="sticky" 
            color="transparent" 
            elevation={0}
            sx={{ 
              backdropFilter: 'blur(10px)',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.3)'
                : 'rgba(255, 255, 255, 0.3)',
              zIndex: 1300,
              transition: theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.standard,
              }),
            }}
          >
            <Toolbar sx={{ position: 'relative', minHeight: isMobile ? 56 : 64}}>
              <Box sx={{ zIndex: 2, position: 'relative', mr: 2, minWidth: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                {leftAction}
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  position: 'absolute',
                  left: 56,
                  right: 56,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                {title}
              </Typography>
              <Box sx={{ ml: 'auto', zIndex: 1, position: 'relative', pointerEvents: 'auto', minWidth: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {rightAction}
                <LanguageSelector />
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={isMobile ? handleDrawerOpen : handleClick}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {isLoadingDatasource && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Chargement des données...
              </Typography>
            </Box>
          )}

          {isMobile ? (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerClose}
            >
              <Box sx={{ width: 250, pt: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} role="presentation">
                <div>
                  <IconButton onClick={handleDrawerClose} sx={{ mb: 1, ml: 1 }}>
                    <ArrowForwardIos />
                  </IconButton>
                  <List>
                    <ListItemButton onClick={handleRefreshDatasource}>
                      <ListItemIcon>
                        <RefreshIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Rafraîchir datasource" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton onClick={toggleTheme}>
                      <ListItemIcon>
                        {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={mode === 'dark' ? 'Mode clair' : 'Mode sombre'} />
                    </ListItemButton>
                    <ListItemButton onClick={() => setShowLegends(v => !v)}>
                      <ListItemIcon>
                        <Switch checked={showLegends} size="small" />
                      </ListItemIcon>
                      <ListItemText primary="Afficher les légendes" />
                    </ListItemButton>
                    <Divider />
                    <MenuItem>
                      <LanguageSelector />
                    </MenuItem>
                  </List>
                </div>
                <Box sx={{ textAlign: 'center', width: '100%', py: 1, fontSize: '0.85rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  v{APP_VERSION}
                </Box>
              </Box>
            </Drawer>
          ) : (
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(130, 128, 119, 0.9)',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[3],
                  transition: theme.transitions.create(['background-color', 'border-color'], {
                    duration: theme.transitions.duration.standard,
                  }),
                }
              }}
            >
              <MenuItem onClick={handleRefreshDatasource}>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Rafraîchir datasource</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={toggleTheme}>
                <ListItemIcon>
                  {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                  {mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setShowLegends(v => !v)}>
                <ListItemIcon>
                  <Switch checked={showLegends} size="small" />
                </ListItemIcon>
                <ListItemText>Afficher les légendes</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <LanguageSelector />
              </MenuItem>
              <Divider />
              <Box sx={{ textAlign: 'center', width: '100%', py: 1, fontSize: '0.85rem', color: 'text.secondary', fontStyle: 'italic' }}>
                v{APP_VERSION}
              </Box>
            </Menu>
          )}

          <Box sx={{ 
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            position: 'relative',
            zIndex: 2,
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.standard,
            }),
            margin: 0,
            padding: 0,
          }}>
            {!isLoadingDatasource && childrenWithProps}
          </Box>
        </Box>
      </DatasourceProvider>
    </LanguageProvider>
  );
};

export default AppLayout; 