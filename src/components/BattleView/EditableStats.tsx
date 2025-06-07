import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Checkbox } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import StatEditPopup from '../CoreComponents/StatEditPopup';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

interface EditableStatsProps {
  stats: {
    m?: string | number;
    t?: string | number;
    sv?: string | number;
    w?: string | number;
    ld?: string | number;
    oc?: string | number;
    invul?: string;
    statId?: string;
    name?: string;
    showName?: boolean;
    active?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
  factionColors: {
    header: string;
  };
  showHeaders?: boolean;
  onStatsChange?: (newStats: EditableStatsProps['stats']) => void;
  unitId?: string;
  armyId?: string;
  statId?: string;
  isMobile?: boolean;
  isBattleMode?: boolean;
  datasheet: {
    abilities: {
      invul?: {
        showInvulnerableSave?: boolean;
        value?: string;
      };
    };
  };
  isFromArmyList?: boolean;
  onActiveChange?: (active: boolean) => void;
}

const statOrder: { key: keyof EditableStatsProps['stats']; label: string; prefix: string }[] = [
  { key: 'm', label: 'M', prefix: 'modified_m' },
  { key: 't', label: 'E', prefix: 'modified_t' },
  { key: 'sv', label: 'SV', prefix: 'modified_sv' },
  { key: 'w', label: 'PV', prefix: 'modified_w' },
  { key: 'ld', label: 'CD', prefix: 'modified_ld' },
  { key: 'oc', label: 'CO', prefix: 'modified_oc' },
];

const formatStatValue = (key: keyof EditableStatsProps['stats'], value: string | number): string => {
  if (!value) return '';
  
  // Nettoyer la valeur des symboles pour l'affichage
  const cleanValue = String(value);
  
  // Ajouter les symboles appropriés selon la stat
  if (key === 'sv' || key === 'ld' || key === 'invul') {
    return cleanValue + '+';
  }
  
  if (key === 'm') {
    return cleanValue + '"';
  }
  
  return cleanValue;
};

const cleanStatValue = (value: string | undefined | number): string => {
  if (!value) return '';
  const strValue = String(value);
  
  // Ne retirer les symboles que s'ils sont à la fin de la valeur
  if (strValue.endsWith('+')) {
    return strValue.slice(0, -1);
  }
  if (strValue.endsWith('"')) {
    return strValue.slice(0, -1);
  }
  if (strValue.endsWith('-')) {
    return strValue.slice(0, -1);
  }
  
  return strValue;
};

const isStatModified = (key: keyof EditableStatsProps['stats'], stats: EditableStatsProps['stats']): boolean => {
  const modifiedValue = (stats as any)["modified_" + key];
  const originalValue = stats[key];
  
  // Si pas de valeur modifiée, retourner false
  if (modifiedValue === undefined) return false;
  
  // Nettoyer les deux valeurs pour la comparaison
  const cleanModifiedValue = cleanStatValue(modifiedValue as string | number | undefined);
  const cleanOriginalValue = cleanStatValue(originalValue as string | number | undefined);
  
  // Comparer les valeurs nettoyées
  return cleanModifiedValue !== cleanOriginalValue;
};

// Fonction pour nettoyer toutes les statistiques
const cleanAllStats = (stats: EditableStatsProps['stats']): EditableStatsProps['stats'] => {
  const cleanedStats = { ...stats };
  statOrder.forEach(({ key }) => {
    if (cleanedStats[key] !== undefined && typeof cleanedStats[key] !== 'boolean') {
      cleanedStats[key] = cleanStatValue(cleanedStats[key] as string | number);
    }
  });
  return cleanedStats;
};

const EditableStats: React.FC<EditableStatsProps> = ({ 
  stats: originalStats, 
  factionColors, 
  showHeaders,
  onStatsChange,
  unitId,
  armyId,
  statId,
  isMobile,
  isBattleMode,
  datasheet,
  isFromArmyList = false,
  onActiveChange
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [selectedStat, setSelectedStat] = useState<{key: keyof EditableStatsProps['stats'], label: string} | null>(null);
  const [stats, setStats] = useState(() => {
    // Nettoyer les statistiques originales
    const cleanedOriginalStats = cleanAllStats(originalStats);

    // Charger les statistiques modifiées depuis le localStorage si elles existent
    if (unitId && armyId && originalStats.statId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const unit = army.units.find((u: any) => u.id === unitId);
        if (unit && Array.isArray(unit.stats)) {
          const stat = unit.stats.find((s: any) => s.statId === originalStats.statId);
          if (stat) {
            // On ne prend que les champs modifiés de CETTE stat
            const modifiedStats = { ...cleanedOriginalStats };
            statOrder.forEach(({ key, prefix }) => {
              if (Object.prototype.hasOwnProperty.call(stat, prefix)) {
                (modifiedStats as any)[prefix] = cleanStatValue(stat[prefix]);
              }
            });
            // Gérer l'invulnérable séparément
            if (Object.prototype.hasOwnProperty.call(stat, 'modified_invul')) {
              (modifiedStats as any)['modified_invul'] = cleanStatValue(stat['modified_invul']);
            }
            return modifiedStats;
          }
        }
      }
    }
    return cleanedOriginalStats;
  });

  const [active, setActive] = useState(() => originalStats.active !== undefined ? originalStats.active : true);

  // Synchroniser le state local avec les props à chaque changement d'unité/stat
  useEffect(() => {
    if (unitId && armyId && originalStats.statId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const unit = army.units.find((u: any) => u.id === unitId);
        if (unit && Array.isArray(unit.stats)) {
          const stat = unit.stats.find((s: any) => s.statId === originalStats.statId);
          if (stat) {
            const modifiedStats = cleanAllStats(originalStats);
            statOrder.forEach(({ key, prefix }) => {
              if (Object.prototype.hasOwnProperty.call(stat, prefix)) {
                (modifiedStats as any)[prefix] = cleanStatValue(stat[prefix]);
              }
            });
            // Gérer l'invulnérable séparément
            if (Object.prototype.hasOwnProperty.call(stat, 'modified_invul')) {
              (modifiedStats as any)['modified_invul'] = cleanStatValue(stat['modified_invul']);
            }
            setStats(modifiedStats);
            return;
          }
        }
      }
    }
    setStats(cleanAllStats(originalStats));
  }, [originalStats, unitId, armyId, statId]);

  useEffect(() => {
    if (originalStats.active !== undefined) setActive(originalStats.active);
  }, [originalStats.active]);

  // Si la stat est inactive, en mode bataille et dans la liste d'armée, ne rien afficher
  if (active === false && isBattleMode && isFromArmyList) {
    return null;
  }

  const getRawValue = (key: keyof EditableStatsProps['stats']) => {
    const modifiedValue = (stats as any)["modified_" + key];
    const originalValue = stats[key];
    return cleanStatValue(modifiedValue !== undefined ? modifiedValue : originalValue);
  };

  const getDisplayValue = (key: keyof EditableStatsProps['stats']) => {
    return formatStatValue(key, getRawValue(key));
  };

  const handleStatClick = (event: React.MouseEvent<HTMLElement>, key: keyof EditableStatsProps['stats'], label: string) => {
    const fullLabel = {
      'm': 'Mouvement',
      't': 'Endurance',
      'sv': 'Sauvegarde',
      'w': 'Points de vie',
      'ld': 'Commandement',
      'oc': 'Contrôle d\'objectif',
      'invul': 'Sauvegarde invulnérable'
    }[key] || label;
    setSelectedStat({ key, label: fullLabel });
  };

  const handleClose = () => {
    setSelectedStat(null);
  };

  const handleValidate = (value: string) => {
    if (selectedStat) {
      // Nettoyer la valeur des symboles avant de la sauvegarder
      const cleanedValue = cleanStatValue(value);
      
      // Ne stocker que dans la clé modifiée
      const newStats = { 
        ...stats, 
        ["modified_" + selectedStat.key]: cleanedValue 
      };
      setStats(newStats);
      
      // Sauvegarder dans le localStorage
      if (unitId && armyId && statId) {
        const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
        const army = armies.find((a: any) => a.armyId === armyId);
        
        if (army) {
          const updatedUnits = army.units.map((u: any) => {
            if (u.id === unitId) {
              const updatedStats = (u.stats || []).map((s: any) => {
                if (s.statId === statId) {
                  const updatedStat = { 
                    ...s, 
                    ["modified_" + selectedStat.key]: cleanedValue 
                  };
                  return updatedStat;
                }
                return s;
              });
              
              const updatedUnit = {
                ...u,
                stats: updatedStats
              };
              return updatedUnit;
            }
            return u;
          });
          
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
      }
      
      if (onStatsChange) {
        onStatsChange(newStats);
      }
    }
    handleClose();
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newActive = event.target.checked;
    setActive(newActive);
    // Mise à jour dans le localStorage si dans une armée
    if (unitId && armyId && statId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const updatedUnits = army.units.map((u: any) => {
          if (u.id === unitId) {
            const updatedStats = (u.stats || []).map((s: any) => {
              if (s.statId === statId) {
                return { ...s, active: newActive };
              }
              return s;
            });
            return { ...u, stats: updatedStats };
          }
          return u;
        });
        const updatedArmy = { ...army, units: updatedUnits, updatedAt: new Date().toISOString() };
        const updatedArmies = armies.map((a: any) => a.armyId === armyId ? updatedArmy : a);
        localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      }
    }
    if (onActiveChange) onActiveChange(newActive);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%' }}>
      {/* Entêtes */}
      {isMobile ? (
        /* Stats Name if needed for mobile */
        <Box>
          {/* Décalage pour la checkbox */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {(!isBattleMode && isFromArmyList) && (
              <Box sx={{ width: '37px' }} />
            )}
            <Typography sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#bfc8d0',
            mt: 0.5,
            textAlign: 'left',
          }}>
            {stats.name}
          </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, mb: '2px', pl: 0.5 }}>
            {(!isBattleMode && isFromArmyList) && (
              <Box sx={{ width: '20px' }} />
            )}
            {statOrder.map(({ key, label }) => (
              <Box key={key} sx={{ width: '36px', textAlign: 'center' }}>
                <Typography sx={{
                  color: '#bfc8d0',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                  letterSpacing: '0.04em',
                  lineHeight: 1.1
                }}>{label}</Typography>
              </Box>
            ))}
            {/* Case invulnérable vide pour alignement */}
            {stats.invul && (
              <Box sx={{ width: '36px' }} />
            )}
          </Box>
        </Box>
      )
        : (
      showHeaders && (
        <Box sx={{ display: 'flex', gap: 1.2, mb: '2px', pl: 0.5 }}>
          {(!isBattleMode && isFromArmyList) && (
            <Box sx={{ width: '22px' }} />
          )}
          {statOrder.map(({ key, label }) => (
            <Box key={key} sx={{ width: '44px', textAlign: 'center' }}>
              <Typography sx={{
                color: '#bfc8d0',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                letterSpacing: '0.04em',
                lineHeight: 1.1
              }}>{label}</Typography>
            </Box>
          ))}
          {originalStats.invul && (
            <Box sx={{ width: '44px' }} />
          )}
        </Box>
      ))}
      {/* Valeurs */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: isMobile ? 1.2 : 1.2 }}>
        {/* Checkbox à gauche si conditions */}
        {(!isBattleMode && isFromArmyList) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={!!active}
              onChange={handleActiveChange}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<RadioButtonCheckedIcon />}
              sx={{ p: 0, }}
            />
          </Box>
        )}
        {statOrder.map(({ key, label }) => (
          <Box
            key={key}
            className="value_container"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              background: factionColors?.header || '#354a5b',
              height: isMobile ? '36px' : '44px',
              width: isMobile ? '36px' : '44px',
              zIndex: 1,
              clipPath: 'polygon(100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%, 10% 0)',
              cursor: isBattleMode ? 'pointer' : 'default',
              '&:hover': {
                opacity: isBattleMode ? 0.9 : 1
              }
            }}
            onClick={isBattleMode ? (e) => handleStatClick(e, key, label) : undefined}
          >
            <Box
              className="value"
              sx={{
                textAlign: 'center',
                height: isMobile ? '32px' : '40px',
                width: isMobile ? '32px' : '40px',
                textTransform: 'uppercase',
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                fontWeight: 600,
                color: isStatModified(key, stats) ? 'primary.main' : (isDarkMode ? 'white' : '#354a5b'),
                zIndex: 2,
                backgroundColor: isDarkMode ? 'rgb(54, 54, 54)' : 'white',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                clipPath: 'polygon(100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%, 10% 0)',
                fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              {getDisplayValue(key)}
            </Box>
          </Box>
        ))}
        {/* Affichage du bouclier invulnérable si présent */}
        <Box 
          sx={{
          pl: 0.5,
          display: 'flex',
          alignItems: 'center',
          height: isMobile ? '36px' : '44px',
          position: 'relative',
          zIndex: 5,
        }}>
          {stats.invul ? (
              <Box 
                onClick={isBattleMode ? (e) => handleStatClick(e, 'invul', 'Sauvegarde invulnérable') : undefined}
                sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: isMobile ? '36px' : '44px',
                width: isMobile ? '36px' : '44px',
                bgcolor: factionColors.header,
                maskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'contain',
                position: 'relative',
                zIndex: 5,
                cursor: isBattleMode ? 'pointer' : 'default',
                '&:hover': {
                  opacity: isBattleMode ? 0.8 : 1,
                  transform: isBattleMode ? 'scale(1.05)' : 'none',
                  transition: 'all 0.2s'
                }
              }}>
                <Box sx={{
                  height: isMobile ? '31px' : '40px',
                  width: isMobile ? '31px' : '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isDarkMode ? 'rgb(54, 54, 54)' : 'white',
                  maskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain'
                }}>
                  <Typography sx={{
                    mb: 0.5,
                    fontSize: '1.1rem',
                    fontWeight: 300,
                    color: isStatModified('invul', stats) ? 'primary.main' : (isDarkMode ? 'white' : factionColors.header)
                  }}>
                    {getDisplayValue('invul')}
                  </Typography>
                </Box>
              </Box>
          ) :
          (
              <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: isMobile ? '36px' : '44px',
                  width: isMobile ? '36px' : '44px',
                  bgcolor: isDarkMode ? 'rgb(11, 25, 37)' : 'rgb(15, 33, 49)',
                  maskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/invul_shield.svg")',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  position: 'relative',
                  zIndex: 5,
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              > 
                <BlockIcon sx={{ 
                  color: isDarkMode ? 'rgb(49, 66, 80)' : 'rgb(49, 66, 80)',
                  fontSize: isMobile ? '1.5rem' : '1.8rem',
                  mb: 0.5,
                  opacity: 0.8
                }} />
              </Box>
          )}
        </Box> 
        {/* Stats Name if needed for desktop */}
        {!isMobile &&(
        <Box sx={{ 
          }}>
            {/* Name Container */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              height: '44px',
              position: 'relative',
              zIndex: 5
            }}>
              {(stats.showName || 'isCombinedUnit' in datasheet) && (
                <Typography sx={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 300,
                  lineHeight: 1
                }}>
                  {stats.name}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {selectedStat && (
        <StatEditPopup
          open={Boolean(selectedStat)}
          onClose={handleClose}
          label={selectedStat.label}
          initialValue={getRawValue(selectedStat.key)}
          originalValue={cleanStatValue(stats[selectedStat.key] as string | number | undefined)}
          onValidate={handleValidate}
          name={stats.name || ''}
          authorizedDVal={!['t', 'sv', 'w', 'ld', 'oc', 'invul'].includes(selectedStat.key as string)}
        />
      )}
    </Box>
  );
};

export default EditableStats; 