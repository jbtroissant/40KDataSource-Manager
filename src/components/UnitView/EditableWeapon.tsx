import React, { useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Checkbox, Chip } from '@mui/material';
import { Weapon } from '../../types/weapon';
import StatEditPopup from '../CoreComponents/StatEditPopup';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { useTranslate } from '../../services/translationService';

interface EditableWeaponProps {
  weapons: Weapon[];
  factionColors: {
    banner: string;
    header: string;
  };
  factionId: string;
  isRanged?: boolean;
  onWeaponsChange?: (newWeapons: Weapon[]) => void;
  unitId?: string;
  armyId?: string;
  isBattleMode?: boolean;
  isFromArmyList?: boolean;
}

const EditableWeapon: React.FC<EditableWeaponProps> = ({ 
  weapons, 
  factionColors, 
  factionId,
  isRanged = true,
  onWeaponsChange,
  unitId,
  armyId,
  isBattleMode = false,
  isFromArmyList = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  const [selectedStat, setSelectedStat] = useState<{key: string, label: string, weaponIndex: number, profileIndex: number} | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    weapons.forEach((weapon, weaponIndex) => {
      const key = `${weaponIndex}`;
      initial[key] = weapon.active ?? true;
    });
    return initial;
  });

  const handleStatClick = (event: React.MouseEvent<HTMLElement> | null, key: string, label: string, weaponIndex: number, profileIndex: number) => {
    if (!isBattleMode) return;
    const fullLabel = {
      'range': 'Portée',
      'attacks': 'Attaques',
      'skill': isRanged ? 'Capacité de Tir' : 'Capacité de Combat',
      'strength': 'Force',
      'ap': 'Pénétration d\'armure',
      'damage': 'Dégâts'
    }[key] || label;
    setSelectedStat({ key, label: fullLabel, weaponIndex, profileIndex });
  };

  const handleClose = () => {
    setSelectedStat(null);
  };

  const handleValidate = (value: string) => {
    if (selectedStat) {
      const newWeapons = [...weapons];
      const profile = newWeapons[selectedStat.weaponIndex].profiles[selectedStat.profileIndex];
      if (!isRanged && selectedStat.key === 'range') {
        (profile as any)[`modified_${selectedStat.key}`] = '0';
      } else {
        (profile as any)[`modified_${selectedStat.key}`] = value;
      }

      // Sauvegarde unifiée dans le localStorage
      if (unitId && armyId) {
        const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
        const army = armies.find((a: any) => a.armyId === armyId);
        if (army) {
          const updatedUnits = army.units.map((u: any) => {
            if (u.id === unitId) {
              if (isRanged) {
                return { ...u, rangedWeapons: newWeapons };
              } else {
                return { ...u, meleeWeapons: newWeapons };
              }
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

      if (onWeaponsChange) {
        onWeaponsChange(newWeapons);
      }
    }
  };

  const handleWeaponSelection = (weaponIndex: number) => {
    const key = `${weaponIndex}`;
    const newSelectedState = !selectedWeapons[key];
    
    setSelectedWeapons(prev => ({
      ...prev,
      [key]: newSelectedState
    }));

    // Mise à jour directe dans le localStorage
    if (unitId && armyId) {
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const updatedUnits = army.units.map((u: any) => {
          if (u.id === unitId) {
            const updatedWeapons = [...(isRanged ? u.rangedWeapons : u.meleeWeapons)];
            updatedWeapons[weaponIndex] = {
              ...updatedWeapons[weaponIndex],
              active: newSelectedState
            };
            
            return {
              ...u,
              [isRanged ? 'rangedWeapons' : 'meleeWeapons']: updatedWeapons
            };
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

    // Mise à jour du state local des armes
    if (onWeaponsChange) {
      const newWeapons = weapons.map((weapon, wIndex) => ({
        ...weapon,
        active: wIndex === weaponIndex ? newSelectedState : weapon.active
      }));
      onWeaponsChange(newWeapons);
    }
  };

  const isStatModified = (key: string, weaponIndex: number, profileIndex: number): boolean => {
    const profile = weapons[weaponIndex].profiles[profileIndex];
    const modifiedValue = (profile as any)[`modified_${key}`];
    const originalValue = profile[key as keyof typeof profile];
    
    if (!isRanged && key === 'range' && modifiedValue === '0') {
      return false;
    }
    
    if (modifiedValue === undefined) {
      return false;
    }
    
    const cleanModifiedValue = cleanStatValue(String(modifiedValue));
    const cleanOriginalValue = cleanStatValue(String(originalValue));
    
    return cleanModifiedValue !== cleanOriginalValue;
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
    if (strValue.startsWith('-')) {
      return strValue.slice(1);
    }
    
    return strValue;
  };

  const formatStatValue = (key: string, value: string | number): string => {
    if (!value) return '';
    
    // Nettoyer la valeur des symboles pour l'affichage
    const cleanValue = cleanStatValue(String(value));
    
    // Ajouter les symboles appropriés selon la stat
    if (key === 'skill') {
      return cleanValue + '+';
    }
    
    if (key === 'ap') {
      const numValue = Number(cleanValue);
      if (numValue === 0) return '0';
      return '-' + Math.abs(numValue);
    }
    
    return cleanValue;
  };

  // Fonction utilitaire pour afficher la valeur modifiée si elle existe
  const getDisplayValue = (profile: any, key: string) => {
    const value = profile[`modified_${key}`] !== undefined ? profile[`modified_${key}`] : profile[key];
    return formatStatValue(key, value);
  };
  return (
    <Box
      sx={{
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '4px',
          top: 0,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          filter: 'brightness(0) invert(1)',
          width: '20px',
          height: '20px',
        },
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            bgcolor: factionColors.header,
            pl: 1,
            display: 'grid',
            gridTemplateColumns: isFromArmyList && !isBattleMode ? '40px 5fr 2fr repeat(5, 1fr)' : '5fr 2fr repeat(5, 1fr)',
            gap: 0,
          }}
        >
          {isFromArmyList && !isBattleMode && (
            <Typography
              sx={{
                textTransform: 'uppercase',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                zIndex: 2,
                textAlign: 'center',
                lineHeight: 1.5,
                py: 0.5,
              }}
            >
              {/* Colonne vide pour l'alignement */}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                width: 20,
                height: 20,
                display: 'inline-block',
                backgroundImage: isRanged
                  ? 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/10th/shooting.svg")'
                  : 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/10th/combat.svg")',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                filter: 'brightness(0) invert(1)',
                mr: 1,
              }}
            />
            <Typography
              sx={{
                textTransform: 'uppercase',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                zIndex: 2,
              }}
            >
              {isRanged ? ('ARMES À DISTANCE' ) : ('ARMES DE MÊLÉE')}
            </Typography>
          </Box>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            PORTÉE
          </Typography>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            A
          </Typography>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            {isRanged ? 'CT' : 'CC'}
          </Typography>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            F
          </Typography>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            PA
          </Typography>
          <Typography
            sx={{
              textTransform: 'uppercase',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            D
          </Typography>
        </Box>
      )}

      {isMobile ? (
        <>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
            ml: isFromArmyList && !isBattleMode ? 5 : 0,
            px: 1,
          }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1 }}>PORTÉE</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1, textAlign: 'center' }}>A</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1, textAlign: 'center' }}>{isRanged ? 'CT' : 'CC'}</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1, textAlign: 'center' }}>F</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1, textAlign: 'center' }}>PA</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#888', flex: 1, textAlign: 'center' }}>D</Typography>
          </Box>

          {weapons.map((weapon, weaponIndex) => {
            if (isBattleMode && weapon.active === false) return null;
            const profiles = weapon.profiles;
            return (
              <Box
                key={`weapon-${weaponIndex}`}
                sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  borderBottom: '1px dotted #636567',
                  '&:nth-of-type(even)': {
                    bgcolor: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.03)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  },
                  '&:nth-of-type(odd)': {
                    bgcolor: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                {isFromArmyList && !isBattleMode && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignSelf: 'stretch',
                      width: '40px',
                      borderRight: '2px solid #636567',
                      p: 0,
                      m: 0,
                      bgcolor: 'transparent',
                    }}
                  >
                    <Checkbox
                      checked={selectedWeapons[`${weaponIndex}`]}
                      onChange={() => handleWeaponSelection(weaponIndex)}
                      size="medium"
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<RadioButtonCheckedIcon />}
                    />
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  {profiles.map((profile, profileIndex) => (
                    <Box
                      key={`${weaponIndex}-${profileIndex}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px dotted #636567',
                        py: 1,
                        px: 1,
                        bgcolor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography sx={{
                          color: isDarkMode ? '#e0e0e0' : 'black',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}>
                          {translate(profile.name, factionId)}
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('range', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'left', fontWeight: 500 }} onClick={() => handleStatClick(null, 'range', 'Portée', weaponIndex, profileIndex)}>
                            {isRanged ? getDisplayValue(profile, 'range') : 'Mêlée'}
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('attacks', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'center', fontWeight: 500 }} onClick={() => handleStatClick(null, 'attacks', 'Attaques', weaponIndex, profileIndex)}>
                            {getDisplayValue(profile, 'attacks')}
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('skill', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'center', fontWeight: 500 }} onClick={() => handleStatClick(null, 'skill', isRanged ? 'Précision' : 'Compétence', weaponIndex, profileIndex)}>
                            {getDisplayValue(profile, 'skill')}
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('strength', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'center', fontWeight: 500 }} onClick={() => handleStatClick(null, 'strength', 'Force', weaponIndex, profileIndex)}>
                            {getDisplayValue(profile, 'strength')}
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('ap', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'center', fontWeight: 500 }} onClick={() => handleStatClick(null, 'ap', 'PA', weaponIndex, profileIndex)}>
                            {getDisplayValue(profile, 'ap')}
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: '1rem', color: isStatModified('damage', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), textAlign: 'center', fontWeight: 500 }} onClick={() => handleStatClick(null, 'damage', 'Dégâts', weaponIndex, profileIndex)}>
                            {getDisplayValue(profile, 'damage')}
                          </Typography>
                        </Box>
                        {profile.keywords && profile.keywords.length > 0 && (
                          <Box sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mt: 0.5,
                            pb: 0.5
                          }}>
                            {profile.keywords.map((keyword, index) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '0.75rem',
                                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                                  color: isDarkMode ? 'white' : factionColors.header,
                                  '& .MuiChip-label': {
                                    px: 1,
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </>
      ) : (
        weapons.map((weapon, weaponIndex) => {
          if (isBattleMode && weapon.active === false) return null;
          const profiles = weapon.profiles;
          return (
            <Box
              key={`weapon-${weaponIndex}`}
              sx={{
                borderBottom: weaponIndex < weapons.length - 1 ? '1px dotted #636567' : 'none',
                display: 'grid',
                gridTemplateColumns: isFromArmyList && !isBattleMode ? '40px 1fr' : '1fr',
                alignItems: 'center',
              }}
            >
              {isFromArmyList && !isBattleMode && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    borderRight: '2px solid #636567',
                    bgcolor: 'transparent',
                  }}
                >
                  <Checkbox
                    checked={selectedWeapons[`${weaponIndex}`]}
                    onChange={() => handleWeaponSelection(weaponIndex)}
                    size="medium"
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<RadioButtonCheckedIcon />}
                  />
                </Box>
              )}
              <Box>
                {profiles.map((profile, profileIndex) => (
                  <Box
                    key={`${weaponIndex}-${profileIndex}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '5fr 2fr repeat(5, 1fr)',
                      alignItems: 'center',
                      pl: 2,
                      mt: 0.5,
                      mb: profileIndex < profiles.length - 1 ? 0.5 : 0,
                    }}
                  >
                    <Typography sx={{ color: isDarkMode ? '#e0e0e0' : 'black', fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {translate(profile.name, factionId)}
                      {profile.keywords && profile.keywords.length > 0 && (
                        <Box sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                          mt: 0.5,
                          pb: 0.5
                        }}>
                          {profile.keywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '0.75rem',
                                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                                color: isDarkMode ? 'white' : factionColors.header,
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Typography>
                    <Typography sx={{ color: isStatModified('range', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'range', 'Portée', weaponIndex, profileIndex)}>
                      {isRanged ? getDisplayValue(profile, 'range') : 'Mêlée'}
                    </Typography>
                    <Typography sx={{ color: isStatModified('attacks', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'attacks', 'Attaques', weaponIndex, profileIndex)}>
                      {getDisplayValue(profile, 'attacks')}
                    </Typography>
                    <Typography sx={{ color: isStatModified('skill', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'skill', isRanged ? 'Précision' : 'Compétence', weaponIndex, profileIndex)}>
                      {getDisplayValue(profile, 'skill')}
                    </Typography>
                    <Typography sx={{ color: isStatModified('strength', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'strength', 'Force', weaponIndex, profileIndex)}>
                      {getDisplayValue(profile, 'strength')}
                    </Typography>
                    <Typography sx={{ color: isStatModified('ap', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'ap', 'PA', weaponIndex, profileIndex)}>
                      {getDisplayValue(profile, 'ap')}
                    </Typography>
                    <Typography sx={{ color: isStatModified('damage', weaponIndex, profileIndex) ? 'primary.main' : (isDarkMode ? '#e0e0e0' : 'black'), fontSize: '0.85rem', lineHeight: 1.2 }} onClick={() => handleStatClick(null, 'damage', 'Dégâts', weaponIndex, profileIndex)}>
                      {getDisplayValue(profile, 'damage')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })
      )}

      {selectedStat && (
        <StatEditPopup
          open={Boolean(selectedStat)}
          onClose={handleClose}
          label={selectedStat.label}
          initialValue={(() => {
            if (!isRanged && selectedStat.key === 'range') {
              return '0';
            }
            const weapon = weapons[selectedStat.weaponIndex];
            const profile = weapon.profiles[selectedStat.profileIndex];
            const modifiedValue = (profile as any)[`modified_${selectedStat.key}`];
            const value = modifiedValue !== undefined ? modifiedValue : (profile as any)[selectedStat.key];
            if (selectedStat.key === 'ap') {
              return cleanStatValue(String(value || ''));
            }
            return cleanStatValue(String(value || ''));
          })()}
          originalValue={(() => {
            if (!isRanged && selectedStat.key === 'range') {
              return '0';
            }
            const weapon = weapons[selectedStat.weaponIndex];
            const profile = weapon.profiles[selectedStat.profileIndex];
            const value = (profile as any)[selectedStat.key];
            if (selectedStat.key === 'ap') {
              return cleanStatValue(String(value || ''));
            }
            return cleanStatValue(String(value || ''));
          })()}
          onValidate={handleValidate}
          name={weapons[selectedStat.weaponIndex].profiles[selectedStat.profileIndex].name}
          authorizedDVal={!['ap', 'skill'].includes(selectedStat.key)}
        />
      )}
    </Box>
  );
};

export default EditableWeapon;