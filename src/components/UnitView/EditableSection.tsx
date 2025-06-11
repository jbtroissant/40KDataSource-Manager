import React, { useState } from 'react';
import { Box, Typography, useTheme, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslate } from '../../services/translationService';
import { useDatasource } from '../../contexts/DatasourceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { saveDatasourceBloc, loadDatasourceBloc } from '../../utils/datasourceDb';

interface EditableSectionProps {
  title?: string;
  factionColors?: {
    banner: string;
    header: string;
  };
  icon?: React.ReactNode;
  content: any;
  onSave?: (newContent: any) => void;
  isArray?: boolean;
  isComplexObject?: boolean;
  factionId: string;
}

const FIELDS_TO_DISPLAY = ['name', 'description', 'range', 'text'];

const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  factionColors = { banner: '', header: '' },
  icon,
  content,
  onSave,
  isArray = false,
  isComplexObject = false,
  factionId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(content);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  const { datasource, setDatasource } = useDatasource();
  const { lang } = useLanguage();

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

  // Sauvegarde la traduction dans le fichier flat de la langue en cours
  const handleSave = async () => {
    let keys: string[] = [];
    let values: string[] = [];
    if (isArray) {
      if (isComplexObject) {
        content.forEach((item: any, idx: number) => {
          Object.entries(item).forEach(([key, value], kidx) => {
            keys.push(value as string);
            values.push(editedContent[idx][key]);
          });
        });
      } else {
        content.forEach((item: any, idx: number) => {
          keys.push(item);
          values.push(editedContent[idx]);
        });
      }
    } else if (isComplexObject && typeof content === 'object') {
      Object.entries(content).forEach(([key, value]) => {
        keys.push(value as string);
        values.push(editedContent[key]);
      });
    } else {
      keys = [content];
      values = [editedContent];
    }

    // Nouvelle logique : on privilégie le bloc flat de la faction
    let blocKey = '';
    const flatKeyPrefix = factionId ? `${factionId}_flat_${lang}` : '';
    if (flatKeyPrefix && datasource[flatKeyPrefix]) {
      blocKey = flatKeyPrefix;
    } else {
      // fallback sur l'ancienne logique
      for (const k of Object.keys(datasource)) {
        if (k.endsWith(`_flat_${lang}`) && datasource[k] && keys.some(key => key in datasource[k])) {
          blocKey = k;
          break;
        }
      }
      if (!blocKey) {
        blocKey = Object.keys(datasource).find(k => k.endsWith(`_flat_${lang}`)) || '';
      }
    }
    if (!blocKey) {
      alert('Impossible de trouver le fichier de langue à modifier.');
      setIsEditing(false);
      return;
    }
    const bloc = await loadDatasourceBloc(blocKey);
    keys.forEach((key, idx) => {
      bloc[key] = values[idx];
    });
    await saveDatasourceBloc(blocKey, bloc);
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
    // Tableau d'objets complexes
    if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object') {
      return (
        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {content.map((item: any, idx: number) => (
            <Box key={idx} sx={{ border: '1px solid #bbb', borderRadius: 1, p: 1, mb: 1 }}>
              {Object.entries(item)
                .filter(([k, v]) => typeof v === 'string' && FIELDS_TO_DISPLAY.includes(k))
                .map(([key, value]) => (
                  <TextField
                    key={key}
                    label={key}
                    value={editedContent[idx]?.[key] ?? translate(value as string, '')}
                    onChange={e => {
                      const newContent = [...editedContent];
                      newContent[idx] = { ...newContent[idx], [key]: e.target.value };
                      setEditedContent(newContent);
                    }}
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                ))}
            </Box>
          ))}
        </Box>
      );
    }
    // Objet complexe
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
      return (
        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(content)
            .filter(([k, v]) => typeof v === 'string' && FIELDS_TO_DISPLAY.includes(k))
            .map(([key, value]) => (
              <TextField
                key={key}
                label={key}
                value={editedContent[key] ?? translate(value as string, '')}
                onChange={e => setEditedContent({ ...editedContent, [key]: e.target.value })}
                size="small"
                fullWidth
                sx={{ mb: 1 }}
              />
            ))}
        </Box>
      );
    }
    // Tableau de strings
    if (Array.isArray(content)) {
      return (
        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {content.map((item: any, idx: number) => (
            <TextField
              key={idx}
              value={editedContent[idx] ?? translate(item as string, '')}
              onChange={e => {
                const newContent = [...editedContent];
                newContent[idx] = e.target.value;
                setEditedContent(newContent);
              }}
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      );
    }
    // String simple
    return (
      <TextField
        value={editedContent ?? translate(content as string, '')}
        onChange={e => setEditedContent(e.target.value)}
        size="small"
        fullWidth
        multiline
      />
    );
  };

  return (
    <Box sx={{ my: 1 }}>
      {title && (
        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      )}
      <Box
        component="div"
        sx={{
          bgcolor: factionColors.header || 'transparent',
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}
        {!isEditing ? (
          <>
            <Box sx={{ flex: 1 }}>
              {/* Affichage amélioré pour objets/arrays */}
              {Array.isArray(content) && content.length > 0 && typeof content[0] === 'object' ? (
                content.map((item: any, idx: number) => {
                  const fields = Object.entries(item)
                    .filter(([k, v]) => typeof v === 'string' && FIELDS_TO_DISPLAY.includes(k));
                  return (
                    <Box key={idx} sx={{ mb: 1, p: 1, border: '1px solid #bbb', borderRadius: 1, bgcolor: '#f5f5f5' }}>
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
                    .filter(([k, v]) => typeof v === 'string' && FIELDS_TO_DISPLAY.includes(k));
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
            <IconButton size="small" onClick={handleEdit} sx={{ color: 'inherit', ml: 1 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            {renderEditContent()}
            <IconButton size="small" onClick={handleSave} sx={{ color: 'inherit' }}>
              <SaveIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancel} sx={{ color: 'inherit' }}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditableSection; 