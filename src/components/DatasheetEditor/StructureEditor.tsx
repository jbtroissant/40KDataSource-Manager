import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography, Paper, Button, Checkbox, FormGroup, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Datasheet } from '../../types/datasheet';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WeaponSection from './WeaponSection';
import { useDatasource } from '../../contexts/DatasourceContext';
import { useNavigate } from 'react-router-dom';
import TranslationKeyField from './TranslationKeyField';

// Liste des abilities core standards (à adapter si besoin)
const CORE_ABILITIES = [
  'Leader', 'Lone Operative', 'Stealth', 'Deadly Demise', 'Feel No Pain', 'Fights First', 'Deep Strike', 'Scouts',
];

// Liste des mots-clés standards
const CORE_KEYWORDS = [
  'Fly', 'Vehicle', 'Mounted', 'Grenades',
  'Infantry', 'Character', 'Epic Hero', 'Psyker', 'Psychic', 'Precision',
  'Lethal Hits', 'Aircraft', 'Twin-linked', 'Hover', 'Monster', 'Primarch',
  'Walker', 'Battleline', 'Smoke', 'Titan', 'Titanic', 'Transport'
];

// Mots-clés qui nécessitent une valeur
const KEYWORDS_WITH_VALUE = ['Feel No Pain', 'Scouts', 'Deadly Demise', 'Anti-', 'Sustained Hits', 'Rapid Fire', 'Melta'];

interface StructureEditorProps {
  datasheet: Datasheet;
  onChange: (datasheet: Datasheet) => void;
}

const StructureEditor: React.FC<StructureEditorProps> = ({ datasheet, onChange }) => {
  const { datasource } = useDatasource();
  const [searchDialogOpen, setSearchDialogOpen] = useState<{ open: boolean, field: string, index?: number, subfield?: 'name' | 'description', subIdx?: number }>({ open: false, field: '', index: undefined, subfield: undefined, subIdx: undefined });
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('basic');

  const handleChange = (field: keyof Datasheet, value: any) => {
    onChange({
      ...datasheet,
      [field]: value
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const sections = [
    { id: 'basic', label: 'Informations de base' },
    { id: 'faction-ability', label: 'Capacité de faction' },
    { id: 'other-abilities', label: 'Autres capacités' },
    { id: 'special-abilities', label: 'Capacités spéciales' },
    { id: 'wargear-abilities', label: 'Capacités d\'équipement' },
    { id: 'primarch-abilities', label: 'Capacités primarch' },
    { id: 'points', label: 'Points' },
    { id: 'stats', label: 'Statistiques' },
    { id: 'melee-weapons', label: 'Armes de mêlée' },
    { id: 'ranged-weapons', label: 'Armes à distance' },
    { id: 'composition', label: 'Composition d\'unité' },
    { id: 'loadout', label: 'Équipement' },
    { id: 'wargear', label: 'Options d\'équipement' },
    { id: 'leads', label: 'Unités dirigées' },
    { id: 'lead-by', label: 'Peut être dirigé par' },
    { id: 'keywords', label: 'Mots-clés' },
    { id: 'faction-keywords', label: 'Mots-clés de faction' },
    { id: 'transport', label: 'Transport' }
  ];

  // Fonction pour ouvrir la recherche de traduction
  const openSearch = (field: string, index?: number) => {
    setSearchDialogOpen({ open: true, field, index });
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Navigation latérale */}
      <Paper sx={{ 
        width: 200, 
        p: 1, 
        mr: 1, 
        position: 'sticky', 
        top: 0, 
        height: 'fit-content', 
        maxHeight: 'calc(100vh - 32px)', 
        overflow: 'auto',
        flexShrink: 0
      }}>
        <Typography variant="subtitle1" sx={{ mb: 1, px: 1 }}>Navigation</Typography>
        <List dense>
          {sections.map((section) => (
            <ListItem key={section.id} disablePadding>
              <ListItemButton
                selected={activeSection === section.id}
                onClick={() => scrollToSection(section.id)}
                sx={{ py: 0.5 }}
              >
                <ListItemText 
                  primary={section.label} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    noWrap: true
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Contenu principal */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Informations de base */}
          <Paper id="basic" sx={{ p: 2 }}>
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

          {/* Capacité de faction */}
          <Paper id="faction-ability" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Capacités de base
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {CORE_ABILITIES.map((ability) => (
                <FormControlLabel
                  key={ability}
                  control={
                    <Checkbox
                      checked={datasheet.abilities.core.some(a => a.startsWith(ability))}
                      onChange={(e) => {
                        const core = [...datasheet.abilities.core];
                        if (e.target.checked) {
                          if (KEYWORDS_WITH_VALUE.includes(ability)) {
                            core.push(`${ability} X`);
                          } else {
                            core.push(ability);
                          }
                        } else {
                          const index = core.findIndex(a => a.startsWith(ability));
                          if (index !== -1) {
                            core.splice(index, 1);
                          }
                        }
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          core
                        });
                      }}
                      size="small"
                    />
                  }
                  label={ability}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {KEYWORDS_WITH_VALUE.map((ability) =>
                datasheet.abilities.core.some(a => a.startsWith(ability)) && (
                  <TextField
                    key={ability}
                    size="small"
                    label={`Valeur pour ${ability}`}
                    value={datasheet.abilities.core.find(a => a.startsWith(ability))?.replace(ability, '').trim() || ''}
                    onChange={(e) => {
                      const core = [...datasheet.abilities.core];
                      const index = core.findIndex(a => a.startsWith(ability));
                      if (index !== -1) {
                        core[index] = `${ability} ${e.target.value.trim()}`;
                        handleChange('abilities', {
                          ...datasheet.abilities,
                          core
                        });
                      }
                    }}
                    sx={{ width: 250 }}
                  />
                )
              )}
            </Box>
          </Paper>

          {/* Autres capacités */}
          <Paper id="other-abilities" sx={{ p: 2, mb: 3 }}>
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
                <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Autre capacité ${idx + 1}`}</Typography>
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

          {/* Capacités spéciales */}
          <Paper id="special-abilities" sx={{ p: 2, mb: 3 }}>
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
              <Typography variant="body2" color="text.secondary">Aucune capacité spéciale.</Typography>
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
                <Typography variant="subtitle2" sx={{ mb: 2 }}>{`Capacité spéciale ${idx + 1}`}</Typography>
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

          {/* Capacités d'équipement */}
          <Paper id="wargear-abilities" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Capacités d'équipement
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
          <Paper id="primarch-abilities" sx={{ p: 2, mb: 3 }}>
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
          <Paper id="points" sx={{ p: 2 }}>
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
          <Paper id="stats" sx={{ p: 2 }}>
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
          <Paper id="melee-weapons" sx={{ p: 2 }}>
            <WeaponSection
              weapons={datasheet.meleeWeapons}
              onChange={(weapons) => handleChange('meleeWeapons', weapons)}
              type="melee"
              title="Armes de mêlée"
              factionId={datasheet.faction_id}
            />
          </Paper>

          {/* Armes à distance */}
          <Paper id="ranged-weapons" sx={{ p: 2 }}>
            <WeaponSection
              weapons={datasheet.rangedWeapons}
              onChange={(weapons) => handleChange('rangedWeapons', weapons)}
              type="ranged"
              title="Armes à distance"
              factionId={datasheet.faction_id}
            />
          </Paper>

          {/* Composition d'unité */}
          <Paper id="composition" sx={{ p: 2, mb: 3 }}>
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

          {/* Équipement */}
          <Paper id="loadout" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Équipement
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 200 }}>
                <TranslationKeyField
                  label="Loadout"
                  value={datasheet.loadout || ''}
                  onChange={val => handleChange('loadout', val)}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'loadout' })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="normal"
                  fullWidth
                />
              </Box>
            </Box>
          </Paper>

          {/* Options d'équipement */}
          <Paper id="wargear" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Options d'équipement
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  const newWargear = [...datasheet.wargear, ''];
                  handleChange('wargear', newWargear);
                }}
                disabled={datasheet.wargear.some(w => !w)}
              >
                Ajouter une option d'équipement
              </Button>
            </Box>
            {datasheet.wargear.length === 0 && (
              <Typography variant="body2" color="text.secondary">Aucun équipement disponible.</Typography>
            )}
            {datasheet.wargear.map((wargear, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TranslationKeyField
                    label={`Équipement ${idx + 1}`}
                    value={wargear}
                    onChange={val => {
                      const newWargear = [...datasheet.wargear];
                      newWargear[idx] = val;
                      handleChange('wargear', newWargear);
                    }}
                    onSearchClick={() => setSearchDialogOpen({ open: true, field: 'wargear', index: idx })}
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
                    const newWargear = [...datasheet.wargear];
                    newWargear.splice(idx, 1);
                    handleChange('wargear', newWargear);
                  }}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>

          {/* Unités dirigées */}
          <Paper id="leads" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Unités dirigées
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  const newLeads = {
                    units: [...(datasheet.leads?.units || []), ''],
                    extra: datasheet.leads?.extra || ''
                  };
                  handleChange('leads', newLeads);
                }}
                disabled={datasheet.leads?.units?.some(u => !u)}
              >
                Ajouter une unité
              </Button>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Unités</Typography>
              {(!datasheet.leads?.units || datasheet.leads.units.length === 0) && (
                <Typography variant="body2" color="text.secondary">Aucune unité dirigée.</Typography>
              )}
              {(datasheet.leads?.units || []).map((unit, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <TranslationKeyField
                      label={`Unité dirigée ${idx + 1}`}
                      value={unit}
                      onChange={val => {
                        const newLeads = {
                          units: [...(datasheet.leads?.units || [])],
                          extra: datasheet.leads?.extra || ''
                        };
                        newLeads.units[idx] = val;
                        handleChange('leads', newLeads);
                      }}
                      onSearchClick={() => setSearchDialogOpen({ open: true, field: 'leads.units', index: idx })}
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
                      const newLeads = {
                        units: [...(datasheet.leads?.units || [])],
                        extra: datasheet.leads?.extra || ''
                      };
                      newLeads.units.splice(idx, 1);
                      handleChange('leads', newLeads);
                    }}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Information supplémentaire</Typography>
              <TranslationKeyField
                label="Information supplémentaire"
                value={datasheet.leads?.extra || ''}
                onChange={val => {
                  const newLeads = {
                    units: [...(datasheet.leads?.units || [])],
                    extra: val
                  };
                  handleChange('leads', newLeads);
                }}
                onSearchClick={() => setSearchDialogOpen({ open: true, field: 'leads.extra' })}
                translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                margin="dense"
                fullWidth
                disabled={false}
              />
            </Box>
          </Paper>

          {/* Peut être dirigé par */}
          <Paper id="lead-by" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Peut être dirigé par
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  const newLeadBy = [...(datasheet.leadBy || []), ''];
                  handleChange('leadBy', newLeadBy);
                }}
                disabled={datasheet.leadBy?.some(l => !l)}
              >
                Ajouter
              </Button>
            </Box>
            {(!datasheet.leadBy || datasheet.leadBy.length === 0) && (
              <Typography variant="body2" color="text.secondary">Aucun leader renseigné.</Typography>
            )}
            {(datasheet.leadBy || []).map((lead, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TranslationKeyField
                    label={`Leader ${idx + 1}`}
                    value={lead}
                    onChange={val => {
                      const newLeadBy = [...(datasheet.leadBy || [])];
                      newLeadBy[idx] = val;
                      handleChange('leadBy', newLeadBy);
                    }}
                    onSearchClick={() => setSearchDialogOpen({ open: true, field: 'leadBy', index: idx })}
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
                    const newLeadBy = [...(datasheet.leadBy || [])];
                    newLeadBy.splice(idx, 1);
                    handleChange('leadBy', newLeadBy);
                  }}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>

          {/* Mots-clés */}
          <Paper id="keywords" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Mots-clés
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  const newKeywords = [...(datasheet.keywords || []), ''];
                  handleChange('keywords', newKeywords);
                }}
              >
                Ajouter un mot-clé personnalisé
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {CORE_KEYWORDS.map((keyword) => (
                <FormControlLabel
                  key={keyword}
                  control={
                    <Checkbox
                      checked={datasheet.keywords?.some(k => k.startsWith(keyword))}
                      onChange={(e) => {
                        const keywords = [...(datasheet.keywords || [])];
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
                        handleChange('keywords', keywords);
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
                datasheet.keywords?.some(k => k.startsWith(keyword)) && (
                  <TextField
                    key={keyword}
                    size="small"
                    label={`Valeur pour ${keyword}`}
                    value={datasheet.keywords.find(k => k.startsWith(keyword))?.replace(keyword, '').trim() || ''}
                    onChange={(e) => {
                      const keywords = [...(datasheet.keywords || [])];
                      const index = keywords.findIndex(k => k.startsWith(keyword));
                      if (index !== -1) {
                        keywords[index] = `${keyword}${keyword === 'Anti-' ? '' : ' '}${e.target.value.trim()}`;
                        handleChange('keywords', keywords);
                      }
                    }}
                    sx={{ width: 150 }}
                  />
                )
              )}
            </Box>
            {/* Mots-clés personnalisés */}
            {(datasheet.keywords || []).filter(k => !CORE_KEYWORDS.some(ck => k.startsWith(ck))).map((keyword, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TranslationKeyField
                    label={`Mot-clé personnalisé ${idx + 1}`}
                    value={keyword}
                    onChange={val => {
                      const keywords = [...(datasheet.keywords || [])];
                      keywords[idx] = val;
                      handleChange('keywords', keywords);
                    }}
                    onSearchClick={() => setSearchDialogOpen({ open: true, field: 'keywords', index: idx })}
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
                    const keywords = [...(datasheet.keywords || [])];
                    keywords.splice(idx, 1);
                    handleChange('keywords', keywords);
                  }}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>

          {/* Mots-clés de faction */}
          <Paper id="faction-keywords" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>
                Mots-clés de faction
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  const newFactions = [...(datasheet.factions || []), ''];
                  handleChange('factions', newFactions);
                }}
              >
                Ajouter un mot-clé de faction
              </Button>
            </Box>
            {(datasheet.factions || []).map((faction, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TranslationKeyField
                    label={`Faction ${idx + 1}`}
                    value={faction}
                    onChange={val => {
                      const factions = [...(datasheet.factions || [])];
                      factions[idx] = val;
                      handleChange('factions', factions);
                    }}
                    onSearchClick={() => setSearchDialogOpen({ open: true, field: 'factions', index: idx })}
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
                    const factions = [...(datasheet.factions || [])];
                    factions.splice(idx, 1);
                    handleChange('factions', factions);
                  }}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>

          {/* Transport */}
          <Paper id="transport" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transport
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 200 }}>
                <TranslationKeyField
                  label="Capacité de transport"
                  value={datasheet.transport || ''}
                  onChange={val => handleChange('transport', val)}
                  onSearchClick={() => setSearchDialogOpen({ open: true, field: 'transport' })}
                  translationsFr={datasource ? datasource[`${datasheet.faction_id}_flat_fr`] : {}}
                  translationsEn={datasource ? datasource[`${datasheet.faction_id}_flat_en`] : {}}
                  margin="normal"
                  fullWidth
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default StructureEditor;