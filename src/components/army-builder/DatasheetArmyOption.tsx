import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, IconButton, Divider, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Datasheet } from '../../types/datasheet';
import { useParams } from 'react-router-dom';
import { Enhancement } from '../../types/detachment';
import { armyService } from '../../services/armyService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useTranslate } from '../../services/translationService';
import ActionButton from '../CoreComponents/ActionButton';
import { Check } from '@mui/icons-material';

// Étendre l'interface Datasheet pour inclure les améliorations
interface DatasheetWithEnhancements extends Datasheet {
  enhancements?: Enhancement[];
}

interface DatasheetArmyOptionProps {
  datasheet: DatasheetWithEnhancements;
  factionColors: {
    banner: string;
    header: string;
  };
  detachment?: any;
  onUnitUpdated?: () => void;
  onUnitRemoved?: () => void;
}

const DatasheetArmyOption: React.FC<DatasheetArmyOptionProps> = ({ 
  datasheet, 
  factionColors,
  detachment: detachmentProp,
  onUnitUpdated,
  onUnitRemoved
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { armyId } = useParams<{ armyId: string }>();
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

  // Sélectionner automatiquement le point actuel de l'unité
  useEffect(() => {
    if (datasheet.points && datasheet.points.length > 0) {
      const currentPoint = datasheet.points.find(p => p.active);
      if (currentPoint) {
        setSelectedPoint(currentPoint);
      } else {
        setSelectedPoint(datasheet.points[0]);
      }
    }
  }, [datasheet.points]);

  // Charger les améliorations actuelles de l'unité
  useEffect(() => {
    if (datasheet.enhancements) {
      setSelectedEnhancements(datasheet.enhancements);
    }
  }, [datasheet.enhancements]);

  // Fonction pour vérifier si une amélioration est déjà utilisée dans l'armée
  const isEnhancementUsed = (enhancementName: string): boolean => {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (!army || !army.units) return false;
    
    return army.units.some((unit: any) => 
      unit.id !== datasheet.id && // Exclure l'unité actuelle
      unit.enhancements && 
      unit.enhancements.some((e: Enhancement) => e.name === enhancementName)
    );
  };

  // Fonction pour filtrer les améliorations déjà utilisées
  const getAvailableEnhancements = (allEnhancements: Enhancement[]): Enhancement[] => {
    return allEnhancements.filter(enhancement => 
      !isEnhancementUsed(enhancement.name) || 
      selectedEnhancements.some(e => e.name === enhancement.name)
    );
  };

  const handleLoadEnhancements = () => {
    if (detachment && detachment.enhancements) {
      const availableEnhancements = getAvailableEnhancements(detachment.enhancements);
      setEnhancements(availableEnhancements);
    }
  };

  // Charger les améliorations au montage du composant
  useEffect(() => {
    if (isEligibleForEnhancements) {
      handleLoadEnhancements();
    }
  }, [isEligibleForEnhancements, detachment]);

  const handleEnhancementToggle = (enhancement: Enhancement) => {
    // Vérifier si l'amélioration est déjà utilisée
    if (isEnhancementUsed(enhancement.name) && !selectedEnhancements.some(e => e.name === enhancement.name)) {
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

  const handleConfirmUpdate = () => {
    if (!selectedPoint || !armyId) return;

    const updatedUnit = {
      ...datasheet,
      points: [selectedPoint],
      enhancements: selectedEnhancements
    };
    
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      const existingUnits = army.units || [];
      const updatedUnits = existingUnits.map((u: any) => 
        u.id === datasheet.id ? updatedUnit : u
      );
      
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArmies = armies.map((a: any) => 
        a.armyId === armyId ? updatedArmy : a
      );
      
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
    }
    
    armyService.refreshUnits(armyId);
    
    showSnackbar('Unité mise à jour avec succès', 'success');
    
    if (onUnitUpdated) {
      onUnitUpdated();
    }
  };

  const handleRemove = () => {
    if (!armyId) return;
    
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      const existingUnits = army.units || [];
      const updatedUnits = existingUnits.filter((u: any) => u.id !== datasheet.id);
      
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArmies = armies.map((a: any) => 
        a.armyId === armyId ? updatedArmy : a
      );
      
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      armyService.refreshUnits(armyId);
      
      showSnackbar('Unité supprimée', 'success');
      
      if (onUnitUpdated) {
        onUnitUpdated();
      }
      if (onUnitRemoved) {
        onUnitRemoved();
      }
    }
  };

  // Vérifier si des modifications sont possibles
  const hasModifications = isEligibleForEnhancements && enhancements.length > 0;

  return (
    <>
      {/* En-tête fixe */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: 'primary.dark',
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
          Modifier {translate(datasheet.name, datasheet.faction_id)}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handleRemove}
            sx={{ 
              color: '#d70505',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton 
            onClick={() => onUnitUpdated && onUnitUpdated()}
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
            Points disponibles
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
                    border: `2px solid ${selectedPoint === point ? isDarkMode ? '#b29600' : '#127184' : 'transparent'}`,
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
                        {point.models} modèle{point.models !== '1' ? 's' : ''}
                      </Typography>
                    )}
                    <Typography sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
                      {point.cost} pts
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                Aucun point disponible
              </Typography>
            )}
          </Box>
        </Box>

        {/* Enhancements Section */}
        {isEligibleForEnhancements && enhancements.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Améliorations disponibles
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
                      border: `2px solid ${isSelected ? isDarkMode ? '#b29600' : '#127184' : 'transparent'}`,
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
                        <Typography variant="subtitle2" sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
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
        <Typography variant="h6" sx={{ color: 'primary.dark' }}>
          Total: {calculateTotalPoints()} pts
        </Typography>
        {hasModifications && (
          <ActionButton
            icon={<Check sx={{ color: theme.palette.primary.main }} />}
            text="Mettre à jour"
            borderColor={theme.palette.primary.main}
            onClick={handleConfirmUpdate}
          />
        )}
      </Box>
    </>
  );
};

export default DatasheetArmyOption; 