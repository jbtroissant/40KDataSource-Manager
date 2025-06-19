import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { Datasheet } from '../../types/datasheet';
import { translateWithLang } from '../../services/translationService';
import { useDatasource } from '../../contexts/DatasourceContext';

// Liste des mots-clés standards
const CORE_KEYWORDS = [
  'Fly', 'Vehicle', 'Mounted', 'Grenades',
  'Infantry', 'Character', 'Epic Hero', 'Psyker', 'Psychic', 'Precision',
  'Lethal Hits', 'Aircraft', 'Twin-linked', 'Hover', 'Monster', 'Primarch',
  'Walker', 'Battleline', 'Smoke', 'Titan', 'Titanic', 'Transport'
];

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

  useEffect(() => {
    if (!datasource) return;

    // Collecte de toutes les clés de traduction utilisées dans la datasheet
    const allKeys: string[] = [];
    if (datasheet.name) allKeys.push(datasheet.name);
    if (datasheet.fluff) allKeys.push(datasheet.fluff);
    if (datasheet.loadout) allKeys.push(datasheet.loadout);
    if (datasheet.leader) allKeys.push(datasheet.leader);
    if (datasheet.transport) allKeys.push(datasheet.transport);
    datasheet.wargear.forEach((wargear) => allKeys.push(wargear));
    datasheet.abilities.faction.forEach((ability) => allKeys.push(ability));
    datasheet.abilities.special.forEach((ability) => {
      if (ability.name) allKeys.push(ability.name);
      if (ability.description) allKeys.push(ability.description);
    });
    datasheet.abilities.other.forEach((ability) => {
      if (ability.name) allKeys.push(ability.name);
      if (ability.description) allKeys.push(ability.description);
    });
    datasheet.abilities.wargear.forEach((ability) => {
      if (ability.name) allKeys.push(ability.name);
      if (ability.description) allKeys.push(ability.description);
    });
    datasheet.abilities.primarch.forEach((primarch) => {
      if (primarch.name) allKeys.push(primarch.name);
      (primarch.abilities || []).forEach((sub) => {
        if (sub.name) allKeys.push(sub.name);
        if (sub.description) allKeys.push(sub.description);
      });
    });
    // Ajout des champs de la capacité 'damaged'
    if (datasheet.damaged) {
      if (datasheet.damaged.description) allKeys.push(datasheet.damaged.description);
      if (datasheet.damaged.range) allKeys.push(datasheet.damaged.range);
    }
    datasheet.stats.forEach((stat) => stat.name && allKeys.push(stat.name));
    datasheet.meleeWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
    datasheet.rangedWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
    datasheet.composition.forEach((entry) => { if (entry) allKeys.push(entry); });
    // Ajout des mots-clés personnalisés
    (datasheet.keywords || []).filter(k => !CORE_KEYWORDS.some(ck => k.startsWith(ck))).forEach(keyword => allKeys.push(keyword));
    // Ajout des mots-clés de faction
    (datasheet.factions || []).forEach(faction => allKeys.push(faction));
    // Ajout des propriétés leads et leadBy
    if (datasheet.leads) {
      datasheet.leads.units.forEach(unit => allKeys.push(unit));
      if (datasheet.leads.extra) allKeys.push(datasheet.leads.extra);
    }
    (datasheet.leadBy || []).forEach(leader => allKeys.push(leader));

    // Génère l'objet des traductions attendues
    const expectedTranslations: Record<string, string> = {};
    allKeys.forEach(key => {
      expectedTranslations[key] = translateWithLang(datasource, key, factionId, language);
    });

    // Test d'égalité profonde (clés et valeurs)
    const keys1 = Object.keys(translations);
    const keys2 = Object.keys(expectedTranslations);
    const sameKeys = keys1.length === keys2.length && keys1.every(k => keys2.includes(k));
    const sameValues = sameKeys && keys1.every(k => translations[k] === expectedTranslations[k]);
    if (!sameValues) {
      setTranslations(expectedTranslations);
    }
    // eslint-disable-next-line
  }, [datasource, factionId, language, datasheet]);

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
              if (datasheet.loadout) allKeys.push(datasheet.loadout);
              if (datasheet.leader) allKeys.push(datasheet.leader);
              if (datasheet.transport) allKeys.push(datasheet.transport);
              datasheet.wargear.forEach((wargear) => allKeys.push(wargear));
              datasheet.abilities.faction.forEach((ability) => allKeys.push(ability));
              datasheet.abilities.special.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              datasheet.stats.forEach((stat) => stat.name && allKeys.push(stat.name));
              datasheet.meleeWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
              datasheet.rangedWeapons.forEach((weapon) => weapon.profiles.forEach((profile) => profile.name && allKeys.push(profile.name)));
              datasheet.abilities.other.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              datasheet.abilities.wargear.forEach((ability) => {
                if (ability.name) allKeys.push(ability.name);
                if (ability.description) allKeys.push(ability.description);
              });
              datasheet.abilities.primarch.forEach((primarch) => {
                if (primarch.name) allKeys.push(primarch.name);
                (primarch.abilities || []).forEach((sub) => {
                  if (sub.name) allKeys.push(sub.name);
                  if (sub.description) allKeys.push(sub.description);
                });
              });
              // Ajout des champs de la capacité 'damaged'
              if (datasheet.damaged) {
                if (datasheet.damaged.description) allKeys.push(datasheet.damaged.description);
                if (datasheet.damaged.range) allKeys.push(datasheet.damaged.range);
              }
              datasheet.composition.forEach((entry) => {
                if (entry) allKeys.push(entry);
              });
              // Ajout des mots-clés personnalisés
              (datasheet.keywords || []).filter(k => !CORE_KEYWORDS.some(ck => k.startsWith(ck))).forEach(keyword => allKeys.push(keyword));
              // Ajout des mots-clés de faction
              (datasheet.factions || []).forEach(faction => allKeys.push(faction));
              // Ajout des propriétés leads et leadBy
              if (datasheet.leads) {
                datasheet.leads.units.forEach(unit => allKeys.push(unit));
                if (datasheet.leads.extra) allKeys.push(datasheet.leads.extra);
              }
              (datasheet.leadBy || []).forEach(leader => allKeys.push(leader));
              // DEBUG : Affiche le mapping fr complet et la valeur pour une clé précise
              console.log('DEBUG mapping fr:', datasource && datasource[`${factionId}_flat_fr`]);
              console.log('DEBUG mapping fr pour datasheets.Lion_ElJonson.abilities.primarch.0.abilities.0.name:',
                datasource && datasource[`${factionId}_flat_fr`] && datasource[`${factionId}_flat_fr`]['datasheets.Lion_ElJonson.abilities.primarch.0.abilities.0.name']);
              const uniqueKeys = Array.from(new Set(allKeys));
              return uniqueKeys.map((key) => {
                const count = allKeys.filter(k => k === key).length;
                // Affichage debug : mapping de traduction français pour la clé
                console.log('DEBUG clé:', key, '=>', translations[key]);
                return (
                  <TextField
                    key={`translation-key-${key}`}
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={5}
                    label={`${key}${count > 1 ? ` (utilisé ${count} fois)` : ''}`}
                    value={translations[key] || ''}
                    onChange={(e) => handleTranslationChange(key, e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        minHeight: '56px'
                      }
                    }}
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