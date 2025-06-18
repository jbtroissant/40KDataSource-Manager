import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { Datasheet } from '../../types/datasheet';
import { useTranslate } from '../../services/translationService';
import { useDatasource } from '../../contexts/DatasourceContext';

interface TranslationEditorProps {
  datasheet: Datasheet;
  factionId: string;
  language: 'fr' | 'en';
  onChange: (translations: Record<string, string>) => void;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({
  datasheet,
  factionId,
  language,
  onChange
}) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const { datasource } = useDatasource();
  const translate = useTranslate();

  useEffect(() => {
    if (datasource) {
      const factionTranslations = datasource.translations?.[language]?.[factionId] || {};
      // Charger les traductions existantes
      const existingTranslations: Record<string, string> = {};
      
      // Traductions de base
      if (datasheet.name) {
        existingTranslations[datasheet.name] = translate(datasheet.name, factionId);
      }
      if (datasheet.fluff) {
        existingTranslations[datasheet.fluff] = translate(datasheet.fluff, factionId);
      }

      // Traductions des capacités
      datasheet.abilities.faction.forEach((ability, index) => {
        existingTranslations[`${datasheet.id}.abilities.faction.${index}`] = translate(ability, factionId);
      });

      datasheet.abilities.special.forEach((ability, index) => {
        existingTranslations[`${datasheet.id}.abilities.special.${index}`] = translate(ability.name, factionId);
      });

      // Traductions des armes
      datasheet.meleeWeapons.forEach((weapon, weaponIndex) => {
        weapon.profiles.forEach((profile, profileIndex) => {
          existingTranslations[`${datasheet.id}.meleeWeapons.${weaponIndex}.profiles.${profileIndex}.name`] = 
            translate(profile.name, factionId);
        });
      });

      datasheet.rangedWeapons.forEach((weapon, weaponIndex) => {
        weapon.profiles.forEach((profile, profileIndex) => {
          existingTranslations[`${datasheet.id}.rangedWeapons.${weaponIndex}.profiles.${profileIndex}.name`] = 
            translate(profile.name, factionId);
        });
      });

      setTranslations(existingTranslations);
    }
  }, [datasource, factionId, language, datasheet, translate]);

  const handleTranslationChange = (key: string, value: string) => {
    const newTranslations = {
      ...translations,
      [key]: value
    };
    setTranslations(newTranslations);
    onChange(newTranslations);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Informations de base */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Informations de base
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nom"
              value={translations[datasheet.name] || ''}
              onChange={(e) => handleTranslationChange(datasheet.name, e.target.value)}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={translations[datasheet.fluff] || ''}
              onChange={(e) => handleTranslationChange(datasheet.fluff, e.target.value)}
            />
          </Box>
        </Paper>

        {/* Capacités */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Capacités
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Capacités de faction */}
            <Typography variant="subtitle1">Capacités de faction</Typography>
            {datasheet.abilities.faction.map((ability, index) => (
              <TextField
                key={`faction-${index}`}
                fullWidth
                label={`Capacité de faction ${index + 1}`}
                multiline
                rows={2}
                value={translations[`${datasheet.id}.abilities.faction.${index}`] || ''}
                onChange={(e) =>
                  handleTranslationChange(
                    `${datasheet.id}.abilities.faction.${index}`,
                    e.target.value
                  )
                }
              />
            ))}

            {/* Capacités spéciales */}
            <Typography variant="subtitle1">Capacités spéciales</Typography>
            {datasheet.abilities.special.map((ability, index) => (
              <TextField
                key={`special-${index}`}
                fullWidth
                label={`Capacité spéciale ${index + 1}`}
                multiline
                rows={2}
                value={translations[`${datasheet.id}.abilities.special.${index}`] || ''}
                onChange={(e) =>
                  handleTranslationChange(
                    `${datasheet.id}.abilities.special.${index}`,
                    e.target.value
                  )
                }
              />
            ))}
          </Box>
        </Paper>

        {/* Armes */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Armes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Armes de mêlée */}
            <Typography variant="subtitle1">Armes de mêlée</Typography>
            {datasheet.meleeWeapons.map((weapon, weaponIndex) => (
              <Box key={`melee-${weaponIndex}`} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weapon.profiles.map((profile, profileIndex) => (
                  <TextField
                    key={`melee-${weaponIndex}-${profileIndex}`}
                    fullWidth
                    label={`Arme de mêlée ${weaponIndex + 1} - Profil ${profileIndex + 1}`}
                    value={translations[`${datasheet.id}.meleeWeapons.${weaponIndex}.profiles.${profileIndex}.name`] || ''}
                    onChange={(e) =>
                      handleTranslationChange(
                        `${datasheet.id}.meleeWeapons.${weaponIndex}.profiles.${profileIndex}.name`,
                        e.target.value
                      )
                    }
                  />
                ))}
              </Box>
            ))}

            {/* Armes à distance */}
            <Typography variant="subtitle1">Armes à distance</Typography>
            {datasheet.rangedWeapons.map((weapon, weaponIndex) => (
              <Box key={`ranged-${weaponIndex}`} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weapon.profiles.map((profile, profileIndex) => (
                  <TextField
                    key={`ranged-${weaponIndex}-${profileIndex}`}
                    fullWidth
                    label={`Arme à distance ${weaponIndex + 1} - Profil ${profileIndex + 1}`}
                    value={translations[`${datasheet.id}.rangedWeapons.${weaponIndex}.profiles.${profileIndex}.name`] || ''}
                    onChange={(e) =>
                      handleTranslationChange(
                        `${datasheet.id}.rangedWeapons.${weaponIndex}.profiles.${profileIndex}.name`,
                        e.target.value
                      )
                    }
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TranslationEditor; 