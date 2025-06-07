import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Dialog, useTheme } from '@mui/material';
import { loadDatasource } from '../../utils/datasourceDb';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import { useParams } from 'react-router-dom';
import AddDatasheetToArmy from '../army-builder/AddDatasheetToArmy';
import DatasheetArmyOption from '../army-builder/DatasheetArmyOption';
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
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, army, isFromArmyList = false, isBattleMode = false, onUnitAdded, onOptionsClick, onUnitUpdated, onBack }) => {
  const theme = useTheme();
  const [factionColors, setFactionColors] = useState({ banner: '#6a0e19', header: '#6d5035' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { armyId } = useParams<{ armyId: string }>();
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detachment, setDetachment] = useState<any>(null);

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

  const handleOptionsDialogClose = () => {
    setOptionsDialogOpen(false);
  };

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
            {/* Mode normal (pas de bataille) et pas depuis ArmyList */}
            {!isBattleMode && !isFromArmyList && (
              <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddDatasheetToArmy 
                  datasheet={unit}
                  factionColors={{
                    banner: theme.palette.primary.main,
                    header: theme.palette.primary.dark
                  }}
                  detachment={detachment}
                  onUnitAdded={onUnitAdded}
                />
              </Box>
            )}
            {/* Mode normal (pas de bataille) et depuis ArmyList */}
            {!isBattleMode && isFromArmyList && (
              <Tooltip title="Options">
                <IconButton
                  onClick={() => setOptionsDialogOpen(true)}
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

        {/* Dialog pour les options de l'unité (ArmyList) */}
        {!isBattleMode && isFromArmyList && (
          <Dialog
            open={optionsDialogOpen}
            onClose={handleOptionsDialogClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
              }
            }}
          >
            <DatasheetArmyOption 
              datasheet={unit} 
              factionColors={factionColors}
              onUnitUpdated={() => {
                if (onUnitUpdated) {
                  onUnitUpdated();
                }
                handleOptionsDialogClose();
              }}
              onUnitRemoved={onBack}
            />
          </Dialog>
        )}

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