import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip, useTheme } from '@mui/material';
import { loadDatasource, saveDatasourceBloc } from '../../utils/datasourceDb';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import UnitHeader from './UnitHeader';
import UnitContent from './UnitContent';
import UnitFooter from './UnitFooter';

interface UnitCardProps {
  unit: any;
  army: {
    chapter?: string;
    subfaction?: string;
    faction?: string;
    factionId?: string;
    armyId?: string;
  };
  isFromArmyList?: boolean;
  isBattleMode?: boolean;
  onUnitAdded?: () => void;
  onOptionsClick?: () => void;
  onUnitUpdated?: () => void;
  onBack?: () => void;
  onUnitDeleted?: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, army, isFromArmyList = false, isBattleMode = false, onUnitAdded, onOptionsClick, onUnitUpdated, onBack, onUnitDeleted }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [factionColors, setFactionColors] = useState({ banner: '#6a0e19', header: '#6d5035' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { armyId } = useParams<{ armyId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [detachment, setDetachment] = useState<any>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    async function fetchColors() {
      try {
        const datasource = await loadDatasource();
        if (datasource) {
          const factionId = unit?.faction_id === "SM" ? army.factionId : unit?.faction_id;
          
          if (factionId) {
            for (const key in datasource) {
              const faction = datasource[key];
              if (faction.id === factionId && faction.colours) {
                setFactionColors({
                  banner: faction.colours.banner,
                  header: faction.colours.header
                });
                return;
              }
            }
          }
        }
      } catch {}
      setFactionColors({ banner: '#6a0e19', header: '#6d5035' });
    }
    fetchColors();
  }, [unit?.faction_id, army.factionId]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (army && army.factionId && army.armyId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const foundArmy = armies.find((a: any) => a.armyId === army.armyId);
      setDetachment(foundArmy?.detachment || null);
    }
  }, [army]);

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = () => {
    if (unit && army.factionId) {
      navigate(`/editor/${army.factionId}/${unit.id}`);
    }
  };

  // Suppression de la datasheet et de ses traductions
  const handleDelete = async () => {
    if (!unit || !army.factionId) return;
    const datasource = await loadDatasource();
    const factionKey = `${army.factionId}_translated`;
    const flatFrKey = `${army.factionId}_flat_fr`;
    const flatEnKey = `${army.factionId}_flat_en`;
    // 1. Supprimer la datasheet du translated
    if (datasource[factionKey]?.datasheets) {
      datasource[factionKey].datasheets = datasource[factionKey].datasheets.filter((ds: any) => ds.id !== unit.id && ds.name !== unit.name);
      await saveDatasourceBloc(factionKey, datasource[factionKey]);
    }
    // 2. Supprimer toutes les clés commençant par datasheets.{id} ou datasheets.{name} dans les flats
    const removeKeys = (bloc: any, prefix: string) => {
      Object.keys(bloc).forEach(key => {
        if (key.startsWith(prefix)) {
          delete bloc[key];
        }
      });
    };
    if (datasource[flatFrKey]) {
      removeKeys(datasource[flatFrKey], `datasheets.${unit.name}`);
      removeKeys(datasource[flatFrKey], `datasheets.${unit.id}`);
      await saveDatasourceBloc(flatFrKey, datasource[flatFrKey]);
    }
    if (datasource[flatEnKey]) {
      removeKeys(datasource[flatEnKey], `datasheets.${unit.name}`);
      removeKeys(datasource[flatEnKey], `datasheets.${unit.id}`);
      await saveDatasourceBloc(flatEnKey, datasource[flatEnKey]);
    }
    setDeleted(true);
    if (onUnitDeleted) onUnitDeleted();
  };

  if (deleted) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Datasheet supprimée.
        </Typography>
      </Box>
    );
  }

  if (!unit) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Sélectionnez une unité pour voir ses détails
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        key={refreshKey}
        sx={{
          bgcolor: 'transparent',
          borderRadius: 1,
          overflowY: 'auto',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: 'calc(100vh - 80px)',
          position: 'relative',
          pb: '32px',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '3px',
            '&:hover': {
              background: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)',
            },
          },
        }}
      >
        {/* En-tête avec options */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'black',
          color: 'white',
          px: 1,
          boxShadow: 1,
          position: 'relative',
          zIndex: 10
        }}>
          <Box sx={{ position: 'absolute', right: 8, top: 8, height: '28px', display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Bouton édition */}
            <Tooltip title="Éditer la datasheet">
              <IconButton
                onClick={handleEdit}
                sx={{ color: 'primary.main', width: '28px', height: '28px' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Bouton suppression */}
            <Tooltip title="Supprimer la datasheet">
              <IconButton
                onClick={handleDelete}
                sx={{ color: 'error.main', width: '28px', height: '28px' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Mode normal (pas de bataille) et depuis ArmyList */}
            {!isBattleMode && isFromArmyList && (
              <Tooltip title="Options">
                <IconButton
                  onClick={onOptionsClick}
                  sx={{
                    color: 'primary.main',
                    width: '28px',
                    height: '28px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem'
                    }
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {/* Mode bataille */}
            {isBattleMode && (
              <Tooltip title="Options">
                <IconButton
                  onClick={handleOptionsClick}
                  sx={{
                    color: 'primary.main',
                    width: '28px',
                    height: '28px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem'
                    }
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
              <IconButton 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                size="small" 
                sx={{ 
                  color: 'primary.main',
                  width: '28px',
                  height: '28px',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <UnitHeader
          datasheet={unit} 
          factionColors={factionColors} 
          isFromArmyList={isFromArmyList}
          onUnitAdded={onUnitAdded}
          isBattleMode={isBattleMode}
        />
        <UnitContent
          datasheet={unit} 
          factionColors={factionColors} 
          armyId={armyId || ''} 
          isBattleMode={isBattleMode}
          showEnhancements={!isBattleMode || isFromArmyList}
          isFromArmyList={isFromArmyList}
        />
        <UnitFooter datasheet={unit} factionColors={factionColors} />
      </Box>

      {/* Overlay plein écran */}
      {isFullscreen && (
        <Box
          key={refreshKey}
          onClick={() => setIsFullscreen(false)}
          sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(20,20,20,0.98)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              width: '100%',
              maxWidth: 1080,
              maxHeight: '95vh',
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflowY: 'auto',
              boxShadow: 8,
              position: 'relative',
              p: 0,
              pb: '32px',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '3px',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          >
            {/* En-tête avec options en plein écran */}
            <Box sx={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'black',
              color: 'white',
              px: 1,
              boxShadow: 1,
              position: 'relative',
              zIndex: 10
            }}>
              <Box sx={{ position: 'absolute', right: 8, display: 'flex', gap: 1 }}>
                {isBattleMode && (
                  <Tooltip title="Options">
                    <IconButton
                      onClick={handleOptionsClick}
                      sx={{
                        width: '28px',
                        height: '28px',
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                          fontSize: '1.2rem'
                        }
                      }}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Quitter le plein écran">
                  <IconButton 
                    onClick={() => setIsFullscreen(false)} 
                    size="small" 
                    sx={{ 
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.2rem'
                      }
                    }}
                  >
                    <FullscreenExitIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <UnitHeader
              datasheet={unit} 
              factionColors={factionColors} 
              isFromArmyList={isFromArmyList}
              onUnitAdded={onUnitAdded}
              isBattleMode={isBattleMode}
            />
            <UnitContent
              datasheet={unit} 
              factionColors={factionColors} 
              armyId={armyId || ''} 
              isBattleMode={isBattleMode}
              showEnhancements={!isBattleMode || isFromArmyList}
              isFromArmyList={isFromArmyList}
            />
            <UnitFooter datasheet={unit} factionColors={factionColors} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default UnitCard; 