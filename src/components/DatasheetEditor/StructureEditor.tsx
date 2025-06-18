import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography, Paper, Button, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent, InputLabel, FormControl, Checkbox, FormGroup, IconButton } from '@mui/material';
import { Datasheet } from '../../types/datasheet';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WeaponSection from './WeaponSection';
import SearchIcon from '@mui/icons-material/Search';
import TranslationSearchDialog from './TranslationSearchDialog';
import { useDatasource } from '../../contexts/DatasourceContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import TranslationKeyField from './TranslationKeyField';


// Liste des abilities core standards (à adapter si besoin)
const CORE_ABILITIES = [
  'Leader', 'Lone Operative', 'Stealth', 'Deadly Demise', 'Feel No Pain', 'Fights First', 'Deep Strike', 'Scouts',
];

// Abilities à valeur (clé dans core, champ dans abilities)
const ABILITIES_WITH_VALUE = [
  { key: 'Feel No Pain', valueField: 'feelNoPainValue', label: 'Valeur Feel No Pain' },
  { key: 'Scouts', valueField: 'scoutValue', label: 'Valeur Scouts' },
  { key: 'Deadly Demise', valueField: 'deadlyDemiseValue', label: 'Valeur Deadly Demise' },
];

interface StructureEditorProps {
  datasheet: Datasheet;
  onChange: (datasheet: Datasheet) => void;
}

const StructureEditor: React.FC<StructureEditorProps> = ({ datasheet, onChange }) => {
  const { datasource } = useDatasource();
  const [searchDialogOpen, setSearchDialogOpen] = useState<{ open: boolean, field: string, index?: number, subfield?: 'name' | 'description', subIdx?: number }>({ open: false, field: '', index: undefined, subfield: undefined, subIdx: undefined });
  const navigate = useNavigate();

  // Effet pour parser les abilities core complexes au chargement
  useEffect(() => {
    if (!datasheet.abilities || !Array.isArray(datasheet.abilities.core)) return;
    let changed = false;
    let newCore = [...datasheet.abilities.core];
    // Extraction factorisée
    const newAbilities: any = { ...datasheet.abilities };
    newCore = newCore.map((a) => {
      for (const { key, valueField } of ABILITIES_WITH_VALUE) {
        if (a.startsWith(key)) {
          const match = a.match(new RegExp(`^${key}\\s*(.*)$`));
          if (match && match[1]) {
            newAbilities[valueField] = match[1].trim();
            changed = true;
          }
          return key;
        }
      }
      return a;
    });
    if (changed) {
      onChange({
        ...datasheet,
        abilities: {
          ...newAbilities,
          core: newCore,
        },
      });
    }
  }, [datasheet, onChange]);

  const handleChange = (field: keyof Datasheet, value: any) => {
    // Gestion spéciale pour abilities : sauvegarde Feel No Pain, Scouts, Deadly Demise avec valeur dans core
    if (field === 'abilities') {
      let abilities = { ...value };
      let core = Array.isArray(abilities.core) ? [...abilities.core] : [];
      // Remove any existing abilities à valeur
      core = core.filter(a => !ABILITIES_WITH_VALUE.some(({ key }) => a.startsWith(key)));
      // Ajoute chaque ability à valeur si cochée
      for (const { key, valueField } of ABILITIES_WITH_VALUE) {
        if (abilities[valueField] && core.includes(key)) {
          core = core.map(a => a === key ? `${key} ${abilities[valueField]}` : a);
        }
      }
      abilities.core = core;
      onChange({
        ...datasheet,
        abilities
      });
      return;
    }
    onChange({
      ...datasheet,
      [field]: value
    });
  };

  // Fonction pour ouvrir la recherche de traduction
  const openSearch = (field: string, index?: number) => {
    setSearchDialogOpen({ open: true, field, index });
  };
  // Fonction pour appliquer la clé sélectionnée
  const handleSelectTranslation = (key: string) => {
    if (searchDialogOpen.field === 'datasheet.name') {
      handleChange('name', key);
    } else if (searchDialogOpen.field === 'datasheet.fluff') {
      handleChange('fluff', key);
    } else if (searchDialogOpen.field.startsWith('stat.name') && typeof searchDialogOpen.index === 'number') {
      const newStats = [...datasheet.stats];
      newStats[searchDialogOpen.index] = { ...newStats[searchDialogOpen.index], name: key };
      handleChange('stats', newStats);
    }
    // ...ajouter d'autres cas si besoin (description, etc.)
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Édition de la fiche</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Informations de base */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Informations de base
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography variant="caption" color="text.secondary">ID : {datasheet.id}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>Faction ID : {datasheet.faction_id}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
              <TranslationKeyField
                label="Nom"
                value={datasheet.name || ''}
                onChange={val => handleChange('name', val)}
                onSearchClick={() => openSearch('datasheet.name')}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="normal"
                fullWidth
              />
              <TranslationKeyField
                label="Fluff / Description"
                value={datasheet.fluff || ''}
                onChange={val => handleChange('fluff', val)}
                onSearchClick={() => openSearch('datasheet.fluff')}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="normal"
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={datasheet.imperialArmour}
                    onChange={(e) => handleChange('imperialArmour', e.target.checked)}
                  />
                }
                label="Imperial Armour"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={datasheet.legends}
                    onChange={(e) => handleChange('legends', e.target.checked)}
                  />
                }
                label="Legends"
              />
            </Box>
          </Box>
        </Paper>

        {/* Capacités de base */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Capacités de base
          </Typography>
          <FormGroup row sx={{ flexWrap: 'wrap', gap: 2 }}>
            {CORE_ABILITIES.map((ability) => (
              <FormControlLabel
                key={ability}
                control={
                  <Checkbox
                    checked={Array.isArray(datasheet.abilities?.core) && datasheet.abilities.core.includes(ability)}
                    onChange={(e) => {
                      const current = Array.isArray(datasheet.abilities?.core) ? datasheet.abilities.core : [];
                      const newCore = e.target.checked
                        ? [...current, ability]
                        : current.filter(a => a !== ability);
                      handleChange('abilities', {
                        ...datasheet.abilities,
                        core: newCore
                      });
                    }}
                  />
                }
                label={
                  datasource && datasource['core_flat_fr'] && datasource['core_flat_fr'][ability]
                    ? `${ability} (${datasource['core_flat_fr'][ability]})`
                    : ability
                }
              />
            ))}
            {/* Champs pour abilities à valeur */}
            {ABILITIES_WITH_VALUE.map(({ key, valueField, label }) => (
              Array.isArray(datasheet.abilities?.core) && datasheet.abilities.core.includes(key) && (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <TextField
                    size="small"
                    label={label}
                    value={(datasheet.abilities as any)[valueField] || ''}
                    onChange={e => handleChange('abilities', {
                      ...datasheet.abilities,
                      [valueField]: e.target.value
                    })}
                    sx={{ width: 100 }}
                  />
                </Box>
              )
            ))}
          </FormGroup>
        </Paper>

        {/* Capacités de faction */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Capacité de faction
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newFaction = [...datasheet.abilities.faction, ''];
                handleChange('abilities', {
                  ...datasheet.abilities,
                  faction: newFaction
                });
              }}
              disabled={datasheet.abilities.faction.some(a => !a)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.abilities.faction.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune capacité de faction.</Typography>
          )}
          {datasheet.abilities.faction.map((ability, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TranslationKeyField
                  label={`Capacité de faction ${idx + 1}`}
                  value={ability}
                  onChange={val => {
                    if (!val) return;
                    const newFaction = [...datasheet.abilities.faction];
                    newFaction[idx] = val;
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      faction: newFaction
                    });
                  }}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'faction', index: idx })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="dense"
                  fullWidth
                  disabled={false}
                />
              </Box>
              <IconButton
                color="error"
                onClick={() => {
                  const newFaction = [...datasheet.abilities.faction];
                  newFaction.splice(idx, 1);
                  handleChange('abilities', {
                    ...datasheet.abilities,
                    faction: newFaction
                  });
                }}
                size="small"
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Paper>

        {/* Capacités spéciales (other) */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Autres capacités
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newOther = [
                  ...datasheet.abilities.other,
                  { name: '', description: '', showAbility: true, showDescription: true }
                ];
                handleChange('abilities', {
                  ...datasheet.abilities,
                  other: newOther
                });
              }}
              disabled={datasheet.abilities.other.some(a => !a.name || !a.description)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.abilities.other.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune capacité spéciale.</Typography>
          )}
          {datasheet.abilities.other.map((ability, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  color="error"
                  onClick={() => {
                    const newOther = [...datasheet.abilities.other];
                    newOther.splice(idx, 1);
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      other: newOther
                    });
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Capacité spéciale ${idx + 1}`}</Typography>
              <TranslationKeyField
                label={`Nom de la capacité`}
                value={ability.name}
                onChange={val => {
                  const newOther = [...datasheet.abilities.other];
                  newOther[idx] = { ...newOther[idx], name: val };
                  handleChange('abilities', {
                    ...datasheet.abilities,
                    other: newOther
                  });
                }}
                onSearchClick={() => setSearchDialogOpen({ open: true, field: 'other', index: idx, subfield: 'name' })}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="dense"
                fullWidth
                disabled={false}
              />
              <Box sx={{ mt: 2, mb: 2 }}>
                <TranslationKeyField
                  label={`Description de la capacité`}
                  value={ability.description}
                  onChange={val => {
                    const newOther = [...datasheet.abilities.other];
                    newOther[idx] = { ...newOther[idx], description: val };
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      other: newOther
                    });
                  }}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'other', index: idx, subfield: 'description' })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="dense"
                  fullWidth
                  disabled={false}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showAbility}
                      onChange={e => {
                        const newOther = [...datasheet.abilities.other];
                        newOther[idx] = { ...newOther[idx], showAbility: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          other: newOther
                        });
                      }}
                    />
                  }
                  label="Afficher la capacité"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showDescription}
                      onChange={e => {
                        const newOther = [...datasheet.abilities.other];
                        newOther[idx] = { ...newOther[idx], showDescription: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          other: newOther
                        });
                      }}
                    />
                  }
                  label="Afficher la description"
                />
              </Box>
            </Paper>
          ))}
        </Paper>

        {/* Capacités spéciales (special) */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Capacités spéciales
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newSpecial = [
                  ...datasheet.abilities.special,
                  { name: '', description: '', showAbility: true, showDescription: true }
                ];
                handleChange('abilities', {
                  ...datasheet.abilities,
                  special: newSpecial
                });
              }}
              disabled={datasheet.abilities.special.some(a => !a.name || !a.description)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.abilities.special.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune capacité spéciale (special).</Typography>
          )}
          {datasheet.abilities.special.map((ability, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  color="error"
                  onClick={() => {
                    const newSpecial = [...datasheet.abilities.special];
                    newSpecial.splice(idx, 1);
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      special: newSpecial
                    });
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Capacité spéciale (special) ${idx + 1}`}</Typography>
              <TranslationKeyField
                label={`Nom de la capacité`}
                value={ability.name}
                onChange={val => {
                  const newSpecial = [...datasheet.abilities.special];
                  newSpecial[idx] = { ...newSpecial[idx], name: val };
                  handleChange('abilities', {
                    ...datasheet.abilities,
                    special: newSpecial
                  });
                }}
                onSearchClick={() => setSearchDialogOpen({ open: true, field: 'special', index: idx, subfield: 'name' })}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="dense"
                fullWidth
                disabled={false}
              />
              <Box sx={{ mt: 2, mb: 2 }}>
                <TranslationKeyField
                  label={`Description de la capacité`}
                  value={ability.description}
                  onChange={val => {
                    const newSpecial = [...datasheet.abilities.special];
                    newSpecial[idx] = { ...newSpecial[idx], description: val };
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      special: newSpecial
                    });
                  }}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'special', index: idx, subfield: 'description' })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="dense"
                  fullWidth
                  disabled={false}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showAbility}
                      onChange={e => {
                        const newSpecial = [...datasheet.abilities.special];
                        newSpecial[idx] = { ...newSpecial[idx], showAbility: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          special: newSpecial
                        });
                      }}
                    />
                  }
                  label="Afficher la capacité"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showDescription}
                      onChange={e => {
                        const newSpecial = [...datasheet.abilities.special];
                        newSpecial[idx] = { ...newSpecial[idx], showDescription: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          special: newSpecial
                        });
                      }}
                    />
                  }
                  label="Afficher la description"
                />
              </Box>
            </Paper>
          ))}
        </Paper>

        {/* Capacités wargear */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Capacités wargear
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newWargear = [
                  ...datasheet.abilities.wargear,
                  { name: '', description: '', showAbility: true, showDescription: true }
                ];
                handleChange('abilities', {
                  ...datasheet.abilities,
                  wargear: newWargear
                });
              }}
              disabled={datasheet.abilities.wargear.some(a => !a.name || !a.description)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.abilities.wargear.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune capacité wargear.</Typography>
          )}
          {datasheet.abilities.wargear.map((ability, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  color="error"
                  onClick={() => {
                    const newWargear = [...datasheet.abilities.wargear];
                    newWargear.splice(idx, 1);
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      wargear: newWargear
                    });
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Capacité wargear ${idx + 1}`}</Typography>
              <TranslationKeyField
                label={`Nom de la capacité`}
                value={ability.name}
                onChange={val => {
                  const newWargear = [...datasheet.abilities.wargear];
                  newWargear[idx] = { ...newWargear[idx], name: val };
                  handleChange('abilities', {
                    ...datasheet.abilities,
                    wargear: newWargear
                  });
                }}
                onSearchClick={() => setSearchDialogOpen({ open: true, field: 'wargear', index: idx, subfield: 'name' })}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="dense"
                fullWidth
                disabled={false}
              />
              <Box sx={{ mt: 2, mb: 2 }}>
                <TranslationKeyField
                  label={`Description de la capacité`}
                  value={ability.description}
                  onChange={val => {
                    const newWargear = [...datasheet.abilities.wargear];
                    newWargear[idx] = { ...newWargear[idx], description: val };
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      wargear: newWargear
                    });
                  }}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'wargear', index: idx, subfield: 'description' })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="dense"
                  fullWidth
                  disabled={false}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showAbility}
                      onChange={e => {
                        const newWargear = [...datasheet.abilities.wargear];
                        newWargear[idx] = { ...newWargear[idx], showAbility: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          wargear: newWargear
                        });
                      }}
                    />
                  }
                  label="Afficher la capacité"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ability.showDescription}
                      onChange={e => {
                        const newWargear = [...datasheet.abilities.wargear];
                        newWargear[idx] = { ...newWargear[idx], showDescription: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          wargear: newWargear
                        });
                      }}
                    />
                  }
                  label="Afficher la description"
                />
              </Box>
            </Paper>
          ))}
        </Paper>

        {/* Capacités primarch */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Capacités primarch
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newPrimarch = [
                  ...datasheet.abilities.primarch,
                  { name: '', showAbility: true, abilities: [] }
                ];
                handleChange('abilities', {
                  ...datasheet.abilities,
                  primarch: newPrimarch
                });
              }}
              disabled={datasheet.abilities.primarch.some(a => !a.name)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.abilities.primarch.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune capacité primarch.</Typography>
          )}
          {datasheet.abilities.primarch.map((primarch, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  color="error"
                  onClick={() => {
                    const newPrimarch = [...datasheet.abilities.primarch];
                    newPrimarch.splice(idx, 1);
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      primarch: newPrimarch
                    });
                  }}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Capacité primarch ${idx + 1}`}</Typography>
              <TranslationKeyField
                label={`Nom de la capacité`}
                value={primarch.name}
                onChange={val => {
                  const newPrimarch = [...datasheet.abilities.primarch];
                  newPrimarch[idx] = { ...newPrimarch[idx], name: val };
                  handleChange('abilities', {
                    ...datasheet.abilities,
                    primarch: newPrimarch
                  });
                }}
                onSearchClick={() => setSearchDialogOpen({ open: true, field: 'primarch', index: idx, subfield: 'name' })}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="dense"
                fullWidth
                disabled={false}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={primarch.showAbility}
                      onChange={e => {
                        const newPrimarch = [...datasheet.abilities.primarch];
                        newPrimarch[idx] = { ...newPrimarch[idx], showAbility: e.target.checked };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          primarch: newPrimarch
                        });
                      }}
                    />
                  }
                  label="Afficher la capacité"
                />
              </Box>
              {/* Gestion des abilities internes au primarch */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Sous-capacités du primarch</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                  onClick={() => {
                    const newPrimarch = [...datasheet.abilities.primarch];
                    newPrimarch[idx] = {
                      ...newPrimarch[idx],
                      abilities: [
                        ...(newPrimarch[idx].abilities || []),
                        { name: '', description: '', showAbility: true, showDescription: true }
                      ]
                    };
                    handleChange('abilities', {
                      ...datasheet.abilities,
                      primarch: newPrimarch
                    });
                  }}
                  disabled={primarch.abilities.some(a => !a.name || !a.description)}
                >
                  Ajouter une sous-capacité
                </Button>
                {primarch.abilities.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Aucune sous-capacité.</Typography>
                )}
                {primarch.abilities.map((sub, subIdx) => (
                  <Paper key={subIdx} sx={{ p: 2, mb: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newPrimarch = [...datasheet.abilities.primarch];
                          const newAbilities = [...newPrimarch[idx].abilities];
                          newAbilities.splice(subIdx, 1);
                          newPrimarch[idx] = { ...newPrimarch[idx], abilities: newAbilities };
                          handleChange('abilities', {
                            ...datasheet.abilities,
                            primarch: newPrimarch
                          });
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <TranslationKeyField
                      label={`Nom de la sous-capacité`}
                      value={sub.name}
                      onChange={val => {
                        const newPrimarch = [...datasheet.abilities.primarch];
                        const newAbilities = [...newPrimarch[idx].abilities];
                        newAbilities[subIdx] = { ...newAbilities[subIdx], name: val };
                        newPrimarch[idx] = { ...newPrimarch[idx], abilities: newAbilities };
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          primarch: newPrimarch
                        });
                      }}
                      onSearchClick={() => setSearchDialogOpen({ open: true, field: 'primarchSub', index: idx, subfield: 'name', subIdx })}
                      translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                      translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                      margin="dense"
                      fullWidth
                      disabled={false}
                    />
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <TranslationKeyField
                        label={`Description de la sous-capacité`}
                        value={sub.description}
                        onChange={val => {
                          const newPrimarch = [...datasheet.abilities.primarch];
                          const newAbilities = [...newPrimarch[idx].abilities];
                          newAbilities[subIdx] = { ...newAbilities[subIdx], description: val };
                          newPrimarch[idx] = { ...newPrimarch[idx], abilities: newAbilities };
                          handleChange('abilities', {
                            ...datasheet.abilities,
                            primarch: newPrimarch
                          });
                        }}
                        onSearchClick={() => setSearchDialogOpen({ open: true, field: 'primarchSub', index: idx, subfield: 'description', subIdx })}
                        translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                        translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                        margin="dense"
                        fullWidth
                        disabled={false}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sub.showAbility}
                            onChange={e => {
                              const newPrimarch = [...datasheet.abilities.primarch];
                              const newAbilities = [...newPrimarch[idx].abilities];
                              newAbilities[subIdx] = { ...newAbilities[subIdx], showAbility: e.target.checked };
                              newPrimarch[idx] = { ...newPrimarch[idx], abilities: newAbilities };
                              handleChange('abilities', {
                                ...datasheet.abilities,
                                primarch: newPrimarch
                              });
                            }}
                          />
                        }
                        label="Afficher la sous-capacité"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sub.showDescription}
                            onChange={e => {
                              const newPrimarch = [...datasheet.abilities.primarch];
                              const newAbilities = [...newPrimarch[idx].abilities];
                              newAbilities[subIdx] = { ...newAbilities[subIdx], showDescription: e.target.checked };
                              newPrimarch[idx] = { ...newPrimarch[idx], abilities: newAbilities };
                              handleChange('abilities', {
                                ...datasheet.abilities,
                                primarch: newPrimarch
                              });
                            }}
                          />
                        }
                        label="Afficher la description"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          ))}
        </Paper>

        {/* Points */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Points
          </Typography>
          {datasheet.points.map((point, index) => (
            <Box key={index} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  label="Coût"
                  value={point.cost}
                  onChange={(e) => {
                    const newPoints = [...datasheet.points];
                    newPoints[index] = { ...point, cost: e.target.value };
                    handleChange('points', newPoints);
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  label="Mot-clé"
                  value={point.keyword || ''}
                  onChange={(e) => {
                    const newPoints = [...datasheet.points];
                    newPoints[index] = { ...point, keyword: e.target.value };
                    handleChange('points', newPoints);
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  label="Modèles"
                  value={point.models}
                  onChange={(e) => {
                    const newPoints = [...datasheet.points];
                    newPoints[index] = { ...point, models: e.target.value };
                    handleChange('points', newPoints);
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 20%', minWidth: 150 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={point.active}
                      onChange={(e) => {
                        const newPoints = [...datasheet.points];
                        newPoints[index] = { ...point, active: e.target.checked };
                        handleChange('points', newPoints);
                      }}
                    />
                  }
                  label="Actif"
                />
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Statistiques */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Statistiques
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                const newStats = [
                  ...datasheet.stats,
                  {
                    name: '',
                    m: '',
                    t: '',
                    sv: '',
                    w: '',
                    ld: '',
                    oc: '',
                    invul: '',
                    showDamagedMarker: false,
                    showName: false,
                    active: true
                  }
                ];
                handleChange('stats', newStats);
              }}
              sx={{ ml: 2 }}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.stats.map((stat, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TranslationKeyField
                    label="Nom du profil"
                    value={stat.name || ''}
                    onChange={val => {
                      const newStats = [...datasheet.stats];
                      newStats[index] = { ...stat, name: val };
                      handleChange('stats', newStats);
                    }}
                    onSearchClick={() => openSearch(`stat.name`, index)}
                    translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                    translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                    margin="normal"
                    fullWidth
                  />
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  sx={{ ml: 1, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
                  onClick={() => {
                    const newStats = [...datasheet.stats];
                    newStats.splice(index, 1);
                    handleChange('stats', newStats);
                  }}
                >
                  Supprimer la ligne
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="M"
                  value={stat.m}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, m: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="T"
                  value={stat.t}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, t: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="Sv"
                  value={stat.sv}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, sv: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="W"
                  value={stat.w}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, w: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="Ld"
                  value={stat.ld}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, ld: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="OC"
                  value={stat.oc}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, oc: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
                <TextField
                  fullWidth
                  label="Invulnérable"
                  value={stat.invul || ''}
                  onChange={(e) => {
                    const newStats = [...datasheet.stats];
                    newStats[index] = { ...stat, invul: e.target.value };
                    handleChange('stats', newStats);
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={stat.showDamagedMarker || false}
                      onChange={(e) => {
                        const newStats = [...datasheet.stats];
                        newStats[index] = { ...stat, showDamagedMarker: e.target.checked };
                        handleChange('stats', newStats);
                      }}
                    />
                  }
                  label="Afficher le marqueur de blessure"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={stat.showName || false}
                      onChange={(e) => {
                        const newStats = [...datasheet.stats];
                        newStats[index] = { ...stat, showName: e.target.checked };
                        handleChange('stats', newStats);
                      }}
                    />
                  }
                  label="Afficher le nom du profil"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={stat.active || false}
                      onChange={(e) => {
                        const newStats = [...datasheet.stats];
                        newStats[index] = { ...stat, active: e.target.checked };
                        handleChange('stats', newStats);
                      }}
                    />
                  }
                  label="Actif"
                />
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Armes de mêlée */}
        <WeaponSection
          weapons={datasheet.meleeWeapons}
          onChange={(weapons) => handleChange('meleeWeapons', weapons)}
          type="melee"
          title="Armes de mêlée"
          factionId={datasheet.faction_id}
        />
        {/* Armes à distance */}
        <WeaponSection
          weapons={datasheet.rangedWeapons}
          onChange={(weapons) => handleChange('rangedWeapons', weapons)}
          type="ranged"
          title="Armes à distance"
          factionId={datasheet.faction_id}
        />

        {/* Composition d'unité */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
              Composition d'unité
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                const newComposition = [...datasheet.composition, ''];
                handleChange('composition', newComposition);
              }}
              disabled={datasheet.composition.some(c => !c)}
            >
              Ajouter
            </Button>
          </Box>
          {datasheet.composition.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune entrée de composition.</Typography>
          )}
          {datasheet.composition.map((entry, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TranslationKeyField
                  label={`Entrée de composition ${idx + 1}`}
                  value={entry}
                  onChange={val => {
                    if (!val) return;
                    const newComposition = [...datasheet.composition];
                    newComposition[idx] = val;
                    handleChange('composition', newComposition);
                  }}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'composition', index: idx })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="dense"
                  fullWidth
                  disabled={false}
                />
              </Box>
              <IconButton
                color="error"
                onClick={() => {
                  const newComposition = [...datasheet.composition];
                  newComposition.splice(idx, 1);
                  handleChange('composition', newComposition);
                }}
                size="small"
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Dialog de recherche de traduction */}
      {datasource && (
        <TranslationSearchDialog
          open={searchDialogOpen.open}
          onClose={() => setSearchDialogOpen({ open: false, field: '', index: undefined, subfield: undefined, subIdx: undefined })}
          onSelect={(key) => {
            if (searchDialogOpen.field === 'faction' && typeof searchDialogOpen.index === 'number') {
              const newFaction = [...datasheet.abilities.faction];
              newFaction[searchDialogOpen.index] = key;
              handleChange('abilities', { ...datasheet.abilities, faction: newFaction });
            } else if (searchDialogOpen.field === 'other' && typeof searchDialogOpen.index === 'number' && searchDialogOpen.subfield) {
              const newOther = [...datasheet.abilities.other];
              newOther[searchDialogOpen.index] = { ...newOther[searchDialogOpen.index], [searchDialogOpen.subfield]: key };
              handleChange('abilities', { ...datasheet.abilities, other: newOther });
            } else if (searchDialogOpen.field === 'special' && typeof searchDialogOpen.index === 'number' && searchDialogOpen.subfield) {
              const newSpecial = [...datasheet.abilities.special];
              newSpecial[searchDialogOpen.index] = { ...newSpecial[searchDialogOpen.index], [searchDialogOpen.subfield]: key };
              handleChange('abilities', { ...datasheet.abilities, special: newSpecial });
            } else if (searchDialogOpen.field === 'wargear' && typeof searchDialogOpen.index === 'number' && searchDialogOpen.subfield) {
              const newWargear = [...datasheet.abilities.wargear];
              newWargear[searchDialogOpen.index] = { ...newWargear[searchDialogOpen.index], [searchDialogOpen.subfield]: key };
              handleChange('abilities', { ...datasheet.abilities, wargear: newWargear });
            } else if (searchDialogOpen.field === 'primarch' && typeof searchDialogOpen.index === 'number' && searchDialogOpen.subfield) {
              const newPrimarch = [...datasheet.abilities.primarch];
              newPrimarch[searchDialogOpen.index] = { ...newPrimarch[searchDialogOpen.index], [searchDialogOpen.subfield]: key };
              handleChange('abilities', { ...datasheet.abilities, primarch: newPrimarch });
            } else if (searchDialogOpen.field === 'primarchSub' && typeof searchDialogOpen.index === 'number' && typeof searchDialogOpen.subIdx === 'number' && searchDialogOpen.subfield) {
              const newPrimarch = [...datasheet.abilities.primarch];
              const newAbilities = [...newPrimarch[searchDialogOpen.index].abilities];
              newAbilities[searchDialogOpen.subIdx] = { ...newAbilities[searchDialogOpen.subIdx], [searchDialogOpen.subfield]: key };
              newPrimarch[searchDialogOpen.index] = { ...newPrimarch[searchDialogOpen.index], abilities: newAbilities };
              handleChange('abilities', { ...datasheet.abilities, primarch: newPrimarch });
            }
          }}
          translationsFr={datasource[`${datasheet.faction_id}_flat_fr`] || {}}
          translationsEn={datasource[`${datasheet.faction_id}_flat_en`] || {}}
          factionId={datasheet.faction_id}
        />
      )}
    </Box>
  );
};

export default StructureEditor; 