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
      // Charger les traductions existantes
      const existingTranslations: Record<string, string> = {};
      
      // Traductions de base
      if (datasheet.name) {
        existingTranslations[datasheet.name] = translate(datasheet.name, factionId);
      }
      if (datasheet.fluff) {
        existingTranslations[datasheet.fluff] = translate(datasheet.fluff, factionId);
      }

      // Abilities de faction
      datasheet.abilities.faction.forEach((ability) => {
        existingTranslations[ability] = translate(ability, factionId);
      });
      // Abilities spéciales
      datasheet.abilities.special.forEach((ability) => {
        existingTranslations[ability.name] = translate(ability.name, factionId);
      });
      // Stats
      datasheet.stats.forEach((stat) => {
        if (stat.name) existingTranslations[stat.name] = translate(stat.name, factionId);
      });
      // Armes de mêlée
      datasheet.meleeWeapons.forEach((weapon) => {
        weapon.profiles.forEach((profile) => {
          if (profile.name) existingTranslations[profile.name] = translate(profile.name, factionId);
        });
      });
      // Armes à distance
      datasheet.rangedWeapons.forEach((weapon) => {
        weapon.profiles.forEach((profile) => {
          if (profile.name) existingTranslations[profile.name] = translate(profile.name, factionId);
        });
      });
      // Abilities other (name et description)
      datasheet.abilities.other.forEach((ability) => {
        if (ability.name) existingTranslations[ability.name] = translate(ability.name, factionId);
        if (ability.description) existingTranslations[ability.description] = translate(ability.description, factionId);
      });

      // On ne met à jour que les traductions qui n'existent pas encore
      const newTranslations = { ...translations };
      Object.entries(existingTranslations).forEach(([key, value]) => {
        if (!translations[key]) {
          newTranslations[key] = value;
        }
      });
      setTranslations(newTranslations);
    }
  }, [datasource, factionId, language, datasheet.id, datasheet.name, datasheet.fluff, datasheet.abilities, datasheet.meleeWeapons, datasheet.rangedWeapons, translate]);

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
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Toutes les traductions utilisées dans la fiche
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(() => {
              // Collecte de toutes les clés de traduction utilisées dans la datasheet
              const allKeys: string[] = [];
              if (datasheet.name) allKeys.push(datasheet.name);
              if (datasheet.fluff) allKeys.push(datasheet.fluff);
              // Abilities
              datasheet.abilities.faction.forEach((ability) => allKeys.push(ability));
              datasheet.abilities.special.forEach((ability) => allKeys.push(ability.name));
              // Stats
              datasheet.stats.forEach((stat) => stat.name && allKeys.push(stat.name));
              // Armes de mêlée
              datasheet.meleeWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
              // Armes à distance
              datasheet.rangedWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
              // Abilities other (name et description)
              datasheet.abilities.other.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              // Abilities special (name et description)
              datasheet.abilities.special.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              // Abilities wargear (name et description)
              datasheet.abilities.wargear.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              // Abilities primarch (name)
              datasheet.abilities.primarch.forEach((primarch) => {
                if (primarch.name) allKeys.push(primarch.name);
                // Sous-capacités du primarch (name et description)
                (primarch.abilities || []).forEach((sub) => {
                  if (sub.name) allKeys.push(sub.name);
                  if (sub.description) allKeys.push(sub.description);
                });
              });
              // Dédupliquer et compter les occurrences
              const uniqueKeys = Array.from(new Set(allKeys));
              return uniqueKeys.map((key) => {
                const count = allKeys.filter(k => k === key).length;
                return (
                  <TextField
                    key={`translation-key-${key}`}
                    fullWidth
                    label={`${key}${count > 1 ? ` (utilisé ${count} fois)` : ''}`}
                    value={translations[key] || ''}
                    onChange={(e) => handleTranslationChange(key, e.target.value)}
                  />
                );
              });
            })()}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TranslationEditor; 