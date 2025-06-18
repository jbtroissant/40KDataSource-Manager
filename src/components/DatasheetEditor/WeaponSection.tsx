import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Switch, FormControlLabel, TextField, Checkbox } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslationKeyField from './TranslationKeyField';
import { useDatasource } from '../../contexts/DatasourceContext';

interface WeaponProfile {
  active: boolean;
  name: string;
  range: string;
  attacks: string;
  skill: string;
  strength: string;
  ap: string;
  damage: string;
  keywords: string[];
}

interface Weapon {
  active: boolean;
  profiles: WeaponProfile[];
}

interface WeaponSectionProps {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  type: 'melee' | 'ranged';
  title: string;
  factionId: string;
}

// Liste des mots-clés disponibles
const WEAPON_KEYWORDS = [
  'Pistol',
  'Hazardous',
  'Blast',
  'Torrent',
  'Ignores Cover',
  'Lethal Hits',
  'Twin-linked',
  'Heavy',
  'Extra Attacks',
  'Assault',
  'Melta',
  'Feel No Pain',
  'Sustained Hits',
  'Rapid Fire',
  'Anti-',
  'Devastating Wounds'
];

// Mots-clés qui nécessitent une valeur
const KEYWORDS_WITH_VALUE = ['Anti-', 'Sustained Hits', 'Rapid Fire', 'Melta'];

const WeaponSection: React.FC<WeaponSectionProps> = ({ weapons, onChange, type, title, factionId }) => {
  const { datasource } = useDatasource();
  const [searchDialogOpen, setSearchDialogOpen] = useState<{ open: boolean, weaponIndex?: number, profileIndex?: number }>({ open: false });

  const addWeapon = () => {
    const newWeapon: Weapon = {
      active: true,
      profiles: [{
        active: true,
        name: '',
        range: '',
        attacks: '',
        skill: '',
        strength: '',
        ap: '',
        damage: '',
        keywords: []
      }]
    };
    onChange([...weapons, newWeapon]);
  };

  const removeWeapon = (index: number) => {
    const newWeapons = [...weapons];
    newWeapons.splice(index, 1);
    onChange(newWeapons);
  };

  const addProfile = (weaponIndex: number) => {
    const newProfile: WeaponProfile = {
      active: true,
      name: '',
      range: '',
      attacks: '',
      skill: '',
      strength: '',
      ap: '',
      damage: '',
      keywords: []
    };
    const newWeapons = [...weapons];
    newWeapons[weaponIndex].profiles.push(newProfile);
    onChange(newWeapons);
  };

  const removeProfile = (weaponIndex: number, profileIndex: number) => {
    const newWeapons = [...weapons];
    newWeapons[weaponIndex].profiles.splice(profileIndex, 1);
    onChange(newWeapons);
  };

  const handleProfileChange = (weaponIndex: number, profileIndex: number, field: keyof WeaponProfile, value: any) => {
    const newWeapons = [...weapons];
    newWeapons[weaponIndex].profiles[profileIndex] = {
      ...newWeapons[weaponIndex].profiles[profileIndex],
      [field]: value
    };
    onChange(newWeapons);
  };

  const openSearch = (weaponIndex: number, profileIndex: number) => {
    setSearchDialogOpen({ open: true, weaponIndex, profileIndex });
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button startIcon={<AddIcon />} onClick={addWeapon} variant="contained" size="small">
          Ajouter une arme
        </Button>
      </Box>
      {weapons.map((weapon, weaponIndex) => (
        <Box key={weaponIndex} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={weapon.active}
                  onChange={(e) => {
                    const newWeapons = [...weapons];
                    newWeapons[weaponIndex] = { ...weapon, active: e.target.checked };
                    onChange(newWeapons);
                  }}
                />
              }
              label="Actif"
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<AddIcon />} onClick={() => addProfile(weaponIndex)} variant="contained" size="small">
                Ajouter un profil
              </Button>
              <Button startIcon={<DeleteIcon />} onClick={() => removeWeapon(weaponIndex)} color="error" variant="contained" size="small">
                Supprimer l'arme
              </Button>
            </Box>
          </Box>
          {weapon.profiles.map((profile, profileIndex) => (
            <Box key={profileIndex} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 100%', mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <TranslationKeyField
                      label="Nom"
                      value={profile.name}
                      onChange={val => handleProfileChange(weaponIndex, profileIndex, 'name', val)}
                      onSearchClick={() => openSearch(weaponIndex, profileIndex)}
                      translationsFr={datasource ? datasource[`${factionId}_flat_fr`] : {}}
                      translationsEn={datasource ? datasource[`${factionId}_flat_en`] : {}}
                      margin="normal"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, ml: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.active || false}
                          onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'active', e.target.checked)}
                        />
                      }
                      label="Profil actif"
                      sx={{ mb: 1 }}
                    />
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => removeProfile(weaponIndex, profileIndex)}
                      color="error"
                      variant="contained"
                      size="small"
                    >
                      Supprimer le profil
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="Portée"
                    value={profile.range}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'range', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="Attaques"
                    value={profile.attacks}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'attacks', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="Compétence"
                    value={profile.skill}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'skill', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="Force"
                    value={profile.strength}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'strength', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="PA"
                    value={profile.ap}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'ap', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 15%', minWidth: 100 }}>
                  <TextField
                    fullWidth
                    label="Dégâts"
                    value={profile.damage}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'damage', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 100%', mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Mots-clés</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {WEAPON_KEYWORDS.map((keyword) => (
                      <FormControlLabel
                        key={keyword}
                        control={
                          <Checkbox
                            checked={profile.keywords.some(k => k.startsWith(keyword))}
                            onChange={(e) => {
                              const keywords = [...profile.keywords];
                              if (e.target.checked) {
                                if (KEYWORDS_WITH_VALUE.includes(keyword)) {
                                  keywords.push(`${keyword}${keyword === 'Anti-' ? 'X' : ' X'}`);
                                } else {
                                  keywords.push(keyword);
                                }
                              } else {
                                const index = keywords.findIndex(k => k.startsWith(keyword));
                                if (index !== -1) {
                                  keywords.splice(index, 1);
                                }
                              }
                              handleProfileChange(weaponIndex, profileIndex, 'keywords', keywords);
                            }}
                            size="small"
                          />
                        }
                        label={keyword}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {KEYWORDS_WITH_VALUE.map((keyword) =>
                      profile.keywords.some(k => k.startsWith(keyword)) && (
                        <TextField
                          key={keyword}
                          size="small"
                          label={`Valeur pour ${keyword}`}
                          value={profile.keywords.find(k => k.startsWith(keyword))?.replace(keyword, '').trim() || ''}
                          onChange={(e) => {
                            const keywords = [...profile.keywords];
                            const index = keywords.findIndex(k => k.startsWith(keyword));
                            if (index !== -1) {
                              keywords[index] = `${keyword}${keyword === 'Anti-' ? '' : ' '}${e.target.value.trim()}`;
                              handleProfileChange(weaponIndex, profileIndex, 'keywords', keywords);
                            }
                          }}
                          sx={{ width: 150 }}
                        />
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Paper>
  );
};

export default WeaponSection; 