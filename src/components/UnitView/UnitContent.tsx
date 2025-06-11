import React, { useState } from 'react';
import { Box, Typography, useTheme, IconButton, TextField, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Datasheet } from '../../types/datasheet';
import { TextFormatService } from '../../services/textFormatService';
import EditableWeapon from './EditableWeapon';
import { useTranslate } from '../../services/translationService';
import { useDatasource } from '../../contexts/DatasourceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { saveDatasourceBloc, loadDatasourceBloc } from '../../utils/datasourceDb';

interface EditableSectionProps {
  title: string;
  factionColors: {
    banner: string;
    header: string;
  };
  icon?: React.ReactNode;
  content: any;
  onSave: (newContent: any) => void;
  isArray?: boolean;
  isComplexObject?: boolean;
}

const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  factionColors,
  icon,
  content,
  onSave,
  isArray = false,
  isComplexObject = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(content);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  const { datasource, setDatasource } = useDatasource();
  const { lang } = useLanguage();

  // Utilitaire pour obtenir la clé brute (ou la liste de clés) à partir du content
  const getKeys = (content: any): string[] => {
    if (Array.isArray(content)) {
      return content.map((item: any) => (typeof item === 'object' && item.name ? item.name : item));
    }
    if (typeof content === 'object' && content !== null) {
      return Object.values(content).map((v: any) => v);
    }
    return [content];
  };

  // Utilitaire pour obtenir la traduction à partir de la clé brute
  const getTranslatedContent = () => {
    if (isArray) {
      return content.map((item: any) => {
        if (isComplexObject && typeof item === 'object') {
          const obj: any = {};
          Object.entries(item).forEach(([key, value]) => {
            obj[key] = translate(value as string, '');
          });
          return obj;
        } else {
          return translate(item, '');
        }
      });
    }
    if (isComplexObject && typeof content === 'object') {
      const obj: any = {};
      Object.entries(content).forEach(([key, value]) => {
        obj[key] = translate(value as string, '');
      });
      return obj;
    }
    return translate(content, '');
  };

  // Quand on passe en mode édition, on affiche la traduction
  const handleEdit = () => {
    setEditedContent(getTranslatedContent());
    setIsEditing(true);
  };

  // Fonction utilitaire pour collecter toutes les paires clé brute / valeur traduite à persister
  const collectTranslationPairs = (original: any, edited: any, pairs: {key: string, value: string}[] = []) => {
    if (Array.isArray(original) && Array.isArray(edited)) {
      for (let i = 0; i < original.length; i++) {
        collectTranslationPairs(original[i], edited[i], pairs);
      }
    } else if (typeof original === 'object' && original !== null && typeof edited === 'object' && edited !== null) {
      for (const k of Object.keys(original)) {
        if (typeof original[k] === 'string' && typeof edited[k] === 'string') {
          pairs.push({ key: original[k], value: edited[k] });
        } else {
          collectTranslationPairs(original[k], edited[k], pairs);
        }
      }
    } else if (typeof original === 'string' && typeof edited === 'string') {
      pairs.push({ key: original, value: edited });
    }
    return pairs;
  };

  // Sauvegarde la traduction dans le fichier flat de la langue en cours
  const handleSave = async () => {
    // Collecter toutes les paires clé brute / valeur traduite à persister
    const pairs = collectTranslationPairs(content, editedContent);
    if (pairs.length === 0) {
      setIsEditing(false);
      if (onSave) onSave(editedContent);
      return;
    }
    // Trouver le bloc flat à modifier
    let blocKey = '';
    for (const k of Object.keys(datasource)) {
      if (k.endsWith(`_flat_${lang}`) && datasource[k] && pairs.some(pair => pair.key in datasource[k])) {
        blocKey = k;
        break;
      }
    }
    if (!blocKey) {
      blocKey = Object.keys(datasource).find(k => k.endsWith(`_flat_${lang}`)) || '';
    }
    if (!blocKey) {
      alert('Impossible de trouver le fichier de langue à modifier.');
      setIsEditing(false);
      return;
    }
    // Charger le bloc
    const bloc = await loadDatasourceBloc(blocKey);
    // Modifier les valeurs
    pairs.forEach(({key, value}) => {
      bloc[key] = value;
    });
    // Sauvegarder
    await saveDatasourceBloc(blocKey, bloc);
    // Rafraîchir le datasource global
    const newDatasource = { ...datasource, [blocKey]: bloc };
    setDatasource(newDatasource);
    setIsEditing(false);
    if (onSave) onSave(editedContent);
  };

  const handleCancel = () => {
    setEditedContent(getTranslatedContent());
    setIsEditing(false);
  };

  const renderEditContent = () => {
    if (isArray) {
      return (
        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {editedContent.map((item: any, index: number) => (
            <Box component="div" key={index} sx={{ display: 'flex', gap: 1 }}>
              {isComplexObject ? (
                Object.entries(item).map(([key, value]) => (
                  <TextField
                    key={key}
                    label={key}
                    value={String(value)}
                    onChange={(e) => {
                      const newContent = [...editedContent];
                      newContent[index] = { ...newContent[index], [key]: e.target.value };
                      setEditedContent(newContent);
                    }}
                    size="small"
                    fullWidth
                  />
                ))
              ) : (
                <TextField
                  value={String(item)}
                  onChange={(e) => {
                    const newContent = [...editedContent];
                    newContent[index] = e.target.value;
                    setEditedContent(newContent);
                  }}
                  size="small"
                  fullWidth
                />
              )}
            </Box>
          ))}
        </Box>
      );
    }

    if (isComplexObject) {
      return (
        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(editedContent).map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              value={String(value)}
              onChange={(e) => {
                setEditedContent({ ...editedContent, [key]: e.target.value });
              }}
              size="small"
              fullWidth
            />
          ))}
        </Box>
      );
    }

    return (
      <TextField
        value={String(editedContent)}
        onChange={(e) => setEditedContent(e.target.value)}
        size="small"
        fullWidth
        multiline
      />
    );
  };

  return (
    <>
      <Box
        component="div"
        sx={{
          bgcolor: factionColors.header,
          pl: 2,
          display: 'grid',
          gridTemplateColumns: '7fr 2fr repeat(5, 1fr)',
          gap: 0,
        }}
      >
        <Typography
          sx={{
            textTransform: 'uppercase',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {icon}
          {title}
          {!isEditing ? (
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{ color: 'white', ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box component="div" sx={{ display: 'flex', gap: 1, ml: 1 }}>
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{ color: 'white' }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                sx={{ color: 'white' }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Typography>
      </Box>
      <Box
        component="div"
        sx={{
          pl: 2,
          pr: 2,
          pt: 1,
          borderBottom: '1px dotted #636567',
          bgcolor: isDarkMode 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        {isEditing ? (
          renderEditContent()
        ) : (
          <Box sx={{ color: isDarkMode ? '#e0e0e0' : 'black', fontSize: '0.85rem', lineHeight: 1.2 }}>
            {Array.isArray(content) && content.length > 0 && typeof content[0] === 'object' ? (
              content.map((item: any, idx: number) => {
                const fields = Object.entries(item)
                  .filter(([k, v]) => typeof v === 'string' && ['name', 'description', 'range', 'text'].includes(k));
                return (
                  <Box key={idx} sx={{ mb: 1, p: 1, border: '1px solid #bbb', borderRadius: 1, bgcolor: isDarkMode ? '#222' : '#f5f5f5' }}>
                    {fields.length > 0 ? (
                      fields.map(([key, value]) => (
                        <Box key={key} sx={{ mb: 0.5 }}>
                          {key === 'name' ? (
                            <Typography sx={{ fontWeight: 700 }}>{translate(value as string, '')}</Typography>
                          ) : (
                            <Typography sx={{ fontSize: '0.95em', color: '#444' }}>{translate(value as string, '')}</Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ fontStyle: 'italic', color: '#888' }}>Aucune donnée textuelle</Typography>
                    )}
                  </Box>
                );
              })
            ) : Array.isArray(content) ? (
              content.map((item: any, idx: number) => (
                <Typography key={idx}>{translate(item as string, '')}</Typography>
              ))
            ) : typeof content === 'object' && content !== null ? (
              (() => {
                const fields = Object.entries(content)
                  .filter(([k, v]) => typeof v === 'string' && ['name', 'description', 'range', 'text'].includes(k));
                return fields.length > 0 ? (
                  fields.map(([key, value]) => (
                    <Box key={key} sx={{ mb: 0.5 }}>
                      {key === 'name' ? (
                        <Typography sx={{ fontWeight: 700 }}>{translate(value as string, '')}</Typography>
                      ) : (
                        <Typography sx={{ fontSize: '0.95em', color: '#444' }}>{translate(value as string, '')}</Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ fontStyle: 'italic', color: '#888' }}>Aucune donnée textuelle</Typography>
                );
              })()
            ) : (
              <Typography>{translate(content as string, '')}</Typography>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

interface UnitContentProps {
  datasheet: Datasheet;
  factionColors: {
    banner: string;
    header: string;
  };
  isFromArmyList?: boolean;
  armyId: string;
  isBattleMode?: boolean;
  showEnhancements?: boolean;
}

const UnitContent: React.FC<UnitContentProps> = ({ 
  datasheet, 
  factionColors, 
  armyId, 
  isBattleMode = false,
  isFromArmyList = false,
  showEnhancements = false
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  
  // State local pour les armes
  const [rangedWeapons, setRangedWeapons] = React.useState(datasheet.rangedWeapons);
  const [meleeWeapons, setMeleeWeapons] = React.useState(datasheet.meleeWeapons);
  const [editedDatasheet, setEditedDatasheet] = React.useState(datasheet);

  const { datasource, setDatasource } = useDatasource();
  const { lang } = useLanguage();

  React.useEffect(() => {
    setRangedWeapons(datasheet.rangedWeapons);
    setMeleeWeapons(datasheet.meleeWeapons);
    setEditedDatasheet(datasheet);
  }, [datasheet]);

  const handleWeaponsChange = () => {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const unitId = datasheet.id;
    if (armyId && unitId) {
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const unit = army.units.find((u: any) => u.id === unitId);
        if (unit) {
          setRangedWeapons(unit.rangedWeapons ? [...unit.rangedWeapons] : []);
          setMeleeWeapons(unit.meleeWeapons ? [...unit.meleeWeapons] : []);
        }
      }
    }
  };
  
  const handleSectionSave = (section: string, newContent: any) => {
    const updatedDatasheet = { ...editedDatasheet };
    switch (section) {
      case 'abilities':
        updatedDatasheet.abilities = newContent;
        break;
      case 'wargear':
        updatedDatasheet.wargear = newContent;
        break;
      case 'composition':
        updatedDatasheet.composition = newContent;
        break;
      case 'leader':
        updatedDatasheet.leader = newContent;
        break;
      case 'leadBy':
        updatedDatasheet.leadBy = newContent;
        break;
      case 'transport':
        updatedDatasheet.transport = newContent;
        break;
      case 'enhancements':
        updatedDatasheet.enhancements = newContent;
        break;
    }
    setEditedDatasheet(updatedDatasheet);
    
    // Sauvegarder dans le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    if (army) {
      const unitIndex = army.units.findIndex((u: any) => u.id === datasheet.id);
      if (unitIndex !== -1) {
        army.units[unitIndex] = updatedDatasheet;
        localStorage.setItem('army_list', JSON.stringify(armies));
      }
    }
  };
  
  // Gestion édition primarch
  const primarchRaw = datasheet.abilities?.primarch;
  const primarch = Array.isArray(primarchRaw) && primarchRaw.length > 0 && typeof primarchRaw[0] === 'object' && primarchRaw[0] !== null && 'abilities' in primarchRaw[0] && Array.isArray(primarchRaw[0].abilities) && 'name' in primarchRaw[0]
    ? primarchRaw[0]
    : null;
  const [isEditingPrimarch, setIsEditingPrimarch] = React.useState(false);
  const [editedPrimarch, setEditedPrimarch] = React.useState(primarch ? {
    name: translate(primarch.name, ''),
    abilities: primarch.abilities.map((ab: any) => ({
      name: translate(ab.name, ''),
      description: translate(ab.description, '')
    }))
  } : { name: '', abilities: [] });
  React.useEffect(() => {
    if (primarch) {
      setEditedPrimarch({
        name: translate(primarch.name, ''),
        abilities: primarch.abilities.map((ab: any) => ({
          name: translate(ab.name, ''),
          description: translate(ab.description, '')
        }))
      });
    }
  }, [primarch?.name, primarch?.abilities]);

  // Sauvegarde la traduction dans le fichier flat de la langue en cours
  const handlePrimarchSave = async () => {
    if (!primarch) return;
    // Récupérer les clés brutes
    const nameKey = primarch.name;
    const abilityKeys = primarch.abilities.map((ab: any) => ({
      name: ab.name,
      description: ab.description
    }));
    // Trouver le bloc flat
    let blocKey = '';
    for (const k of Object.keys(datasource)) {
      if (k.endsWith(`_flat_${lang}`) && datasource[k] && (
        [nameKey, ...abilityKeys.map(a => a.name), ...abilityKeys.map(a => a.description)].some(key => key in datasource[k])
      )) {
        blocKey = k;
        break;
      }
    }
    if (!blocKey) {
      blocKey = Object.keys(datasource).find(k => k.endsWith(`_flat_${lang}`)) || '';
    }
    if (!blocKey) {
      alert('Impossible de trouver le fichier de langue à modifier.');
      setIsEditingPrimarch(false);
      return;
    }
    const bloc = await loadDatasourceBloc(blocKey);
    // Mettre à jour les traductions
    bloc[nameKey] = editedPrimarch.name;
    abilityKeys.forEach((keys, idx) => {
      bloc[keys.name] = editedPrimarch.abilities[idx].name;
      bloc[keys.description] = editedPrimarch.abilities[idx].description;
    });
    await saveDatasourceBloc(blocKey, bloc);
    const updatedPrimarch = { ...primarch, name: nameKey, abilities: primarch.abilities.map((ab: any, idx: number) => ({
      ...ab,
      name: abilityKeys[idx].name,
      description: abilityKeys[idx].description
    })) };
    const updatedAbilities = { ...editedDatasheet.abilities, primarch: [{ ...updatedPrimarch }] };
    setDatasource({ ...datasource, [blocKey]: bloc });
    handleSectionSave('abilities', updatedAbilities);
    setIsEditingPrimarch(false);
  };

  const handlePrimarchCancel = () => {
    if (primarch) {
      setEditedPrimarch({
        name: translate(primarch.name, ''),
        abilities: primarch.abilities.map((ab: any) => ({
          name: translate(ab.name, ''),
          description: translate(ab.description, '')
        }))
      });
    }
    setIsEditingPrimarch(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '468px',
        width: '100%',
        maxWidth: '1080px',
        mx: 'auto',
        bgcolor: factionColors.header,
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 96%)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          top: 0,
          mt: '-4px',
          minHeight: '468px',
          width: 'calc(100% - 4px)',
          bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 96%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
        }}
      >
        {/* Armes à distance */}
        <EditableWeapon 
          weapons={rangedWeapons || []} 
          factionColors={factionColors} 
          isRanged={true} 
          unitId={datasheet.id}
          armyId={armyId}
          onWeaponsChange={handleWeaponsChange}
          isBattleMode={isBattleMode}
          isFromArmyList={isFromArmyList}
          factionId={datasheet.faction_id}
        />

        {/* Armes de mêlée */}
        <EditableWeapon 
          weapons={meleeWeapons || []} 
          factionColors={factionColors} 
          isRanged={false} 
          unitId={datasheet.id}
          armyId={armyId}
          onWeaponsChange={handleWeaponsChange}
          isBattleMode={isBattleMode}
          isFromArmyList={isFromArmyList}
          factionId={datasheet.faction_id}
        />

        {/* Primarch Section */}
        {primarch && (
          <Box key="primarch" sx={{ mb: 2 }}>
            <Box sx={{ bgcolor: factionColors.header, pl: 2, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ textTransform: 'uppercase', color: 'white', fontSize: '0.9rem', fontWeight: 600, flex: 1, display: 'flex', alignItems: 'center' }}>
                APTITUDES DE PRIMARQUE
              </Typography>
              {!isEditingPrimarch ? (
                <IconButton size="small" onClick={() => setIsEditingPrimarch(true)} sx={{ color: 'white' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <IconButton size="small" onClick={handlePrimarchSave} sx={{ color: 'white' }}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handlePrimarchCancel} sx={{ color: 'white' }}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            <Box sx={{ pl: 2, pr: 2, pt: 1, borderBottom: '1px dotted #636567', bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              {!isEditingPrimarch ? (
                <>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{translate(primarch.name, '')}</Typography>
                  {primarch.abilities.map((ab: any, idx: number) => (
                    <Box key={idx} sx={{ mb: 2, p: 1, border: '1px solid #bbb', borderRadius: 1, bgcolor: isDarkMode ? '#222' : '#f5f5f5' }}>
                      <Typography sx={{ fontWeight: 700 }}>{translate(ab.name, '')}</Typography>
                      <Typography sx={{ fontSize: '0.95em', color: '#444' }}>{translate(ab.description, '')}</Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <>
                  <TextField
                    label="Nom de l'aptitude de primarque"
                    value={editedPrimarch.name}
                    onChange={e => setEditedPrimarch({ ...editedPrimarch, name: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  {editedPrimarch.abilities.map((ab: any, idx: number) => (
                    <Box key={idx} sx={{ mb: 2, p: 1, border: '1px solid #bbb', borderRadius: 1, bgcolor: isDarkMode ? '#222' : '#f5f5f5' }}>
                      <TextField
                        label="Nom de l'aptitude"
                        value={ab.name}
                        onChange={e => {
                          const newAbilities = [...editedPrimarch.abilities];
                          newAbilities[idx] = { ...newAbilities[idx], name: e.target.value };
                          setEditedPrimarch({ ...editedPrimarch, abilities: newAbilities });
                        }}
                        size="small"
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Description"
                        value={ab.description}
                        onChange={e => {
                          const newAbilities = [...editedPrimarch.abilities];
                          newAbilities[idx] = { ...newAbilities[idx], description: e.target.value };
                          setEditedPrimarch({ ...editedPrimarch, abilities: newAbilities });
                        }}
                        size="small"
                        fullWidth
                        multiline
                      />
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Primarch Section */}
        {datasheet.abilities && Object.entries(datasheet.abilities).map(([key, value]) => {
          if (key === 'primarch') return null; // On ne veut pas le rendu générique pour primarch
          // Détection du type de champ
          const isArray = Array.isArray(value);
          const isComplexObject = (isArray && value.length > 0 && typeof value[0] === 'object') || (!isArray && typeof value === 'object' && value !== null);
          // Titre lisible
          const TITLES: Record<string, string> = {
            core: 'APTITUDES DE BASE',
            damaged: 'ENDOMMAGÉ',
            faction: 'APTITUDES DE FACTION',
            other: 'AUTRES APTITUDES',
            special: 'APTITUDES SPÉCIALES',
            wargear: "APTITUDES D'ÉQUIPEMENT"
          };
          return (
            <EditableSection
              key={key}
              title={TITLES[key] || key.toUpperCase()}
              factionColors={factionColors}
              content={value}
              onSave={(newContent) => {
                const updatedAbilities = { ...editedDatasheet.abilities, [key]: newContent };
                handleSectionSave('abilities', updatedAbilities);
              }}
              isArray={isArray}
              isComplexObject={isComplexObject}
            />
          );
        })}

        {/* Damaged Abilities */}
        <EditableSection
          title="ENDOMAGÉ"
          factionColors={factionColors}
          content={datasheet.abilities?.damaged || {}}
          onSave={(newContent) => handleSectionSave('abilities', {
            ...editedDatasheet.abilities,
            damaged: newContent
          })}
          isComplexObject={true}
          icon={
            <Box
              sx={{
                position: 'relative',
                width: '16px',
                height: '16px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/Toughness.svg")',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  filter: 'brightness(0) invert(1)',
                  width: '16px',
                  height: '16px',
                },
              }}
            />
          }
        />

        {/* Wargear Options */}
        <EditableSection
          title="OPTIONS D'ÉQUIPEMENT"
          factionColors={factionColors}
          content={datasheet.wargear || []}
          onSave={(newContent) => handleSectionSave('wargear', newContent)}
          isArray={true}
        />

        {/* Unit Composition */}
        <EditableSection
          title="COMPOSITION DE L'UNITÉ"
          factionColors={factionColors}
          content={datasheet.composition || []}
          onSave={(newContent) => handleSectionSave('composition', newContent)}
          isArray={true}
        />

        {/* Leader */}
        <EditableSection
          title="MENEUR"
          factionColors={factionColors}
          content={datasheet.leader || ''}
          onSave={(newContent) => handleSectionSave('leader', newContent)}
        />

        {/* Lead By */}
        <EditableSection
          title="Mené par"
          factionColors={factionColors}
          content={datasheet.leadBy || []}
          onSave={(newContent) => handleSectionSave('leadBy', newContent)}
          isArray={true}
        />

        {/* Transport Section */}
        <EditableSection
          title="TRANSPORT"
          factionColors={factionColors}
          content={datasheet.transport || ''}
          onSave={(newContent) => handleSectionSave('transport', newContent)}
        />
      </Box>
    </Box>
  );
};

export default UnitContent; 