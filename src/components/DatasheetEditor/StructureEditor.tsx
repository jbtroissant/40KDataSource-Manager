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
  const [searchDialogOpen, setSearchDialogOpen] = useState<{ open: boolean, field: string, index?: number }>({ open: false, field: '' });
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
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/faction/${datasheet.faction_id}`)} color="primary">
          <ArrowBackIcon />
        </IconButton>
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
            <Box sx={{ flex: '1 1 100%' }}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Abilities core</Typography>
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
              </Box>
            </Box>
          </Box>
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
          <Typography variant="h6" gutterBottom>
            Statistiques
          </Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
            >
              Ajouter une ligne de stats
            </Button>
          </Box>
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
      </Box>

      {/* Dialog de recherche de traduction */}
      {datasource && (
        <TranslationSearchDialog
          open={searchDialogOpen.open}
          onClose={() => setSearchDialogOpen({ open: false, field: '' })}
          onSelect={handleSelectTranslation}
          translationsFr={datasource[`${datasheet.faction_id}_flat_fr`] || {}}
          translationsEn={datasource[`${datasheet.faction_id}_flat_en`] || {}}
          factionId={datasheet.faction_id}
        />
      )}
    </Box>
  );
};

export default StructureEditor; 