import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, IconButton, Divider, Button, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Datasheet } from '../../types/datasheet';
import { useParams } from 'react-router-dom';
import { Enhancement } from '../../types/detachment';
import { armyService } from '../../services/armyService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useTranslate } from '../../services/translationService';
import ActionButton from '../CoreComponents/ActionButton';
import { Add } from '@mui/icons-material';

interface AddDatasheetToArmyProps {
  datasheet: Datasheet;
  factionColors: {
    banner: string;
    header: string;
  };
  detachment: any;
  onUnitAdded?: () => void;
  isSelected?: boolean | null;
}

const AddDatasheetToArmy: React.FC<AddDatasheetToArmyProps> = ({ 
  datasheet, 
  factionColors,
  detachment: detachmentProp,
  onUnitAdded,
  isSelected = null
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { armyId } = useParams<{ armyId: string }>();
  const [open, setOpen] = useState(false);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<Enhancement[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{ cost: string; keyword: string | null; models: string; active: boolean } | null>(null);
  const { showSnackbar } = useSnackbar();
  const translate = useTranslate();

  // Ajout : récupération dynamique du détachement si non fourni
  const [detachment, setDetachment] = useState<any>(detachmentProp || null);
  useEffect(() => {
    if (!detachmentProp && armyId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const army = armies.find((a: any) => a.armyId === armyId);
      setDetachment(army?.detachment || null);
    } else if (detachmentProp) {
      setDetachment(detachmentProp);
    }
  }, [detachmentProp, armyId]);

  const isEligibleForEnhancements = datasheet.keywords.some(keyword => 
    keyword.toLowerCase() === 'character'
  ) && !datasheet.keywords.some(keyword => 
    keyword.toLowerCase() === 'epic hero'
  );

  // Sélectionner automatiquement le seul choix d'unité disponible
  useEffect(() => {
    if (datasheet.points && datasheet.points.length === 1) {
      setSelectedPoint(datasheet.points[0]);
    }
  }, [datasheet.points]);

  // Sélectionner automatiquement l'unité lorsqu'il n'y en a qu'une seule
  useEffect(() => {
    if (open && datasheet.points && datasheet.points.length === 1) {
      setSelectedPoint(datasheet.points[0]);
    }
  }, [open, datasheet.points]);

  // Fonction pour vérifier si une amélioration est déjà utilisée dans l'armée
  const isEnhancementUsed = (enhancementName: string): boolean => {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (!army || !army.units) return false;
    
    return army.units.some((unit: any) => 
      unit.enhancements && unit.enhancements.some((e: Enhancement) => e.name === enhancementName)
    );
  };

  // Fonction pour filtrer les améliorations déjà utilisées
  const getAvailableEnhancements = (allEnhancements: Enhancement[]): Enhancement[] => {
    return allEnhancements.filter(enhancement => !isEnhancementUsed(enhancement.name));
  };

  const handleOpen = () => {
    setOpen(true);
    if (isEligibleForEnhancements) {
      handleLoadEnhancements();
    } else if (datasheet.points && datasheet.points.length === 1) {
      // Si l'unité n'a qu'un seul coût en points et n'est pas éligible aux améliorations,
      // on l'ajoute directement à l'armée
      const newUnit = {
        ...datasheet,
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        datasheetId: datasheet.id,
        points: datasheet.points,
        enhancements: [],
        stats: (datasheet.stats || []).map(stat => ({
          ...stat,
          statId: stat.statId && typeof stat.statId === 'string' && stat.statId.length > 0
            ? stat.statId
            : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15))
        })),
      };
      
      if (armyId) {
        armyService.addUnit(armyId, newUnit);
        armyService.refreshUnits(armyId);
        
        // Notifier le parent qu'une unité a été ajoutée
        if (onUnitAdded) {
          onUnitAdded();
        }
        showSnackbar('Unité ajoutée', 'success');
      }
      
      handleClose();
    }
  };

  const handleLoadEnhancements = () => {
    if (detachment && detachment.enhancements) {
      const availableEnhancements = getAvailableEnhancements(detachment.enhancements);
      setEnhancements(availableEnhancements);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEnhancements([]);
    setSelectedPoint(null);
    setEnhancements([]);
  };

  const handleEnhancementToggle = (enhancement: Enhancement) => {
    // Vérifier si l'amélioration est déjà utilisée
    if (isEnhancementUsed(enhancement.name)) {
      return;
    }

    setSelectedEnhancements(prev => {
      if (prev.some(e => e.name === enhancement.name)) {
        return [];
      }
      return [enhancement];
    });
  };

  const handlePointSelect = (point: { cost: string; keyword: string | null; models: string; active: boolean }) => {
    setSelectedPoint(point);
  };

  const calculateTotalPoints = () => {
    if (!selectedPoint) return 0;
    
    const basePoints = parseInt(selectedPoint.cost, 10) || 0;
    const enhancementPoints = selectedEnhancements.reduce((total, enhancement) => {
      const cost = typeof enhancement.cost === 'string' ? parseInt(enhancement.cost, 10) : enhancement.cost;
      return total + (cost || 0);
    }, 0);
    
    return basePoints + enhancementPoints;
  };

  const handleConfirmAdd = () => {
    if (!selectedPoint || !armyId) return;

    // Récupérer l'armée pour obtenir la sous-faction
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (!army) return;

    const newUnit = {
      ...datasheet,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      datasheetId: datasheet.id,
      points: [selectedPoint],
      enhancements: selectedEnhancements,
      stats: (datasheet.stats || []).map(stat => ({
        ...stat,
        statId: stat.statId && typeof stat.statId === 'string' && stat.statId.length > 0
          ? stat.statId
          : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15))
      })),
      subfaction: army.subfaction || army.faction
    };
    
    // Ajouter l'unité avec la sous-faction
    armyService.addUnit(armyId, newUnit);
    
    // Forcer un rafraîchissement des unités
    armyService.refreshUnits(armyId);
    
    // Notifier le parent qu'une unité a été ajoutée
    if (onUnitAdded) {
      onUnitAdded();
    }
    showSnackbar('Unité ajoutée', 'success');
    
    handleClose();
  };

  return (
    <>
      <IconButton 
        onClick={handleOpen}
        sx={{
          width: '32px',
          height: '32px',
          '& .MuiSvgIcon-root': {
            color: isSelected ? 'white' : 'primary.main',
          }
        }}
      >
        <AddCircleOutlineIcon sx={{ fontSize: '1.2rem' }} />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* En-tête fixe */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: factionColors.header,
            position: 'relative',
          }}
        >
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            {translate(datasheet.name, datasheet.faction_id)}
          </Typography>
          
          <IconButton 
            onClick={handleClose}
            sx={{ 
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        {/* Contenu défilant */}
        <Box
          sx={{
            p: 3,
            bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflow: 'auto',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          {/* Points Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Configuration d'unité
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {datasheet.points && datasheet.points.length > 0 ? (
                datasheet.points.map((point, index) => (
                  <Box
                    key={index}
                    onClick={() => handlePointSelect(point)}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: `2px solid ${selectedPoint === point ? factionColors.header : 'transparent'}`,
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {point.models && (
                        <Typography sx={{ color: 'text.primary' }}>
                          {point.models} figurine{point.models !== '1' ? 's' : ''}
                        </Typography>
                      )}
                      <Typography sx={{ color: factionColors.header, fontWeight: 'bold' }}>
                        {point.cost} pts
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>
                  Pas de configuration disponnible
                </Typography>
              )}
            </Box>
          </Box>

          {/* Enhancements Section */}
          {isEligibleForEnhancements && enhancements.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                Améliorations dipsonibles
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {enhancements.map((enhancement, index) => {
                  const isSelected = selectedEnhancements.some(e => e.name === enhancement.name);
                  return (
                    <Box
                      key={index}
                      onClick={() => handleEnhancementToggle(enhancement)}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: `2px solid ${isSelected ? factionColors.header : 'transparent'}`,
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: factionColors.header, fontWeight: 'bold' }}>
                            {translate(enhancement.name, datasheet.faction_id)} ({enhancement.cost} pts)
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {translate(enhancement.description, datasheet.faction_id)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Footer fixe */}
        <Divider />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
        }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {translate('total', datasheet.faction_id)}: {calculateTotalPoints()} pts
          </Typography>
            <ActionButton
              icon={<Add sx={{ color: theme.palette.primary.main }} />}
              text="Ajouter à l'armée"
              borderColor={theme.palette.primary.main}
              onClick={handleConfirmAdd}
            />
        </Box>
      </Dialog>
    </>
  );
};

export default AddDatasheetToArmy; 