import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  'Devastating Wounds',
  'One Shot'
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

  const duplicateWeapon = (index: number) => {
    const weaponToDuplicate = weapons[index];
    const newWeapon = JSON.parse(JSON.stringify(weaponToDuplicate)); // Deep clone
    onChange([...weapons, newWeapon]);
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

  const renderProfile = (weapon: Weapon, weaponIndex: number, profile: WeaponProfile, profileIndex: number) => (
    <Card 
      key={profileIndex} 
      variant="outlined" 
      sx={{ 
        mb: 2,
        backgroundColor: profile.active ? 'background.paper' : 'action.disabledBackground'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* En-tête du profil */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <TranslationKeyField
                label="Nom"
                value={profile.name}
                onChange={val => handleProfileChange(weaponIndex, profileIndex, 'name', val)}
                onSearchClick={() => openSearch(weaponIndex, profileIndex)}
                translationsFr={datasource ? datasource[`${factionId}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${factionId}_flat_en`] : {}}
                margin="none"
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.active || false}
                    onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'active', e.target.checked)}
                  />
                }
                label="Actif"
              />
              <Tooltip title="Supprimer le profil">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => removeProfile(weaponIndex, profileIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Caractéristiques du profil */}
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="Portée"
              value={profile.range}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'range', e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="Attaques"
              value={profile.attacks}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'attacks', e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="Compétence"
              value={profile.skill}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'skill', e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="Force"
              value={profile.strength}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'strength', e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="PA"
              value={profile.ap}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'ap', e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="Dégâts"
              value={profile.damage}
              onChange={(e) => handleProfileChange(weaponIndex, profileIndex, 'damage', e.target.value)}
              sx={{ width: 100 }}
            />
          </Stack>

          {/* Mots-clés */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Mots-clés</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {WEAPON_KEYWORDS.map((keyword) => (
                <FormControlLabel
                  key={keyword}
                  control={
                    <Checkbox
                      checked={profile.keywords.some(k => k.startsWith(keyword))}
                      onChange={(e) => {
                        const newKeywords = [...profile.keywords];
                        if (e.target.checked) {
                          if (KEYWORDS_WITH_VALUE.includes(keyword)) {
                            newKeywords.push(`${keyword}${keyword === 'Anti-' ? 'X' : ' X'}`);
                          } else {
                            newKeywords.push(keyword);
                          }
                        } else {
                          const index = newKeywords.findIndex(k => k.startsWith(keyword));
                          if (index !== -1) {
                            newKeywords.splice(index, 1);
                          }
                        }
                        handleProfileChange(weaponIndex, profileIndex, 'keywords', newKeywords);
                      }}
                      size="small"
                    />
                  }
                  label={keyword}
                />
              ))}
            </Box>
            {/* Champs pour les mots-clés avec valeur */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {KEYWORDS_WITH_VALUE.map((keyword) =>
                profile.keywords.some(k => k.startsWith(keyword)) && (
                  <TextField
                    key={keyword}
                    size="small"
                    label={`Valeur pour ${keyword}`}
                    value={profile.keywords.find(k => k.startsWith(keyword))?.replace(keyword, '').trim() || ''}
                    onChange={(e) => {
                      const newKeywords = [...profile.keywords];
                      const index = newKeywords.findIndex(k => k.startsWith(keyword));
                      if (index !== -1) {
                        newKeywords[index] = `${keyword}${keyword === 'Anti-' ? '' : ' '}${e.target.value.trim()}`;
                        handleProfileChange(weaponIndex, profileIndex, 'keywords', newKeywords);
                      }
                    }}
                    sx={{ width: 150 }}
                  />
                )
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button startIcon={<AddIcon />} onClick={addWeapon} variant="contained" size="small">
          Ajouter une arme
        </Button>
      </Box>

      <Stack spacing={3}>
        {weapons.map((weapon, weaponIndex) => (
          <Card key={weaponIndex} variant="outlined">
            <CardHeader
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
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
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addProfile(weaponIndex)} 
                    variant="outlined" 
                    size="small"
                  >
                    Ajouter un profil
                  </Button>
                  <Tooltip title="Dupliquer l'arme">
                    <IconButton 
                      onClick={() => duplicateWeapon(weaponIndex)}
                      size="small"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer l'arme">
                    <IconButton 
                      onClick={() => removeWeapon(weaponIndex)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              title={`Arme ${weaponIndex + 1}`}
              sx={{
                backgroundColor: weapon.active ? 'action.hover' : 'action.disabledBackground',
                color: weapon.active ? 'text.primary' : 'text.primary',
                '& .MuiCardHeader-action': {
                  alignSelf: 'center',
                  marginTop: 0
                }
              }}
            />
            <CardContent>
              <Stack spacing={2}>
                {weapon.profiles.map((profile, profileIndex) => 
                  renderProfile(weapon, weaponIndex, profile, profileIndex)
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
};

export default WeaponSection; 