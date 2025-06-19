import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Button, Stack, Typography, IconButton } from '@mui/material';
import DatasheetList from './CoreComponents/DatasheetList';
import UnitCard from './UnitView/UnitCard';
import FactionRules from './FactionRules';
import DetachmentSelector from './DetachmentSelector';
import DetachmentDetails from './DetachmentDetails';
import CleanupDialog from './CleanupDialog';
import { Datasheet } from '../types/datasheet';
import { useParams, useNavigate } from 'react-router-dom';
import { loadDatasource, saveDatasourceBloc } from '../utils/datasourceDb';
import { useTranslate } from '../services/translationService';
import AppLayout from './AppLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useDatasource } from '../contexts/DatasourceContext';

const FactionView: React.FC = () => {
  const [selectedDatasheet, setSelectedDatasheet] = useState<Datasheet | null>(null);
  const [factionRulesOpen, setFactionRulesOpen] = useState(false);
  const [detachmentSelectorOpen, setDetachmentSelectorOpen] = useState(false);
  const [detachmentDetailsOpen, setDetachmentDetailsOpen] = useState(false);
  const [selectedDetachment, setSelectedDetachment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { factionId } = useParams<{ factionId: string }>();
  const [factionName, setFactionName] = useState<string>('');
  const [factionIconUrl, setFactionIconUrl] = useState<string>('');
  const translate = useTranslate();
  const navigate = useNavigate();
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [keysToRemove, setKeysToRemove] = useState<string[]>([]);
  const [translationDataToRemove, setTranslationDataToRemove] = useState<Record<string, string>>({});
  const [keyReplacements, setKeyReplacements] = useState<Record<string, string>>({});
  const [keyUsageLocations, setKeyUsageLocations] = useState<Record<string, string[]>>({});
  const [standardKeywordsToRemove, setStandardKeywordsToRemove] = useState<string[]>([]);
  const { datasource: contextDatasource, reloadDatasource, forceReloadDatasource } = useDatasource();

  // Liste des mots-clés standards à supprimer automatiquement
  const STANDARD_KEYWORDS_TO_REMOVE = [
    'Fly', 'Vehicle', 'Mounted', 'Grenades', 'Infantry', 'Character', 'Epic Hero', 
    'Psyker', 'Psychic', 'Precision', 'Lethal Hits', 'Aircraft', 'Twin-linked', 
    'Hover', 'Monster', 'Primarch', 'Walker', 'Battleline', 'Smoke', 'Titan', 
    'Titanic', 'Transport', 'Leader', 'Lone Operative', 'Stealth', 'Deadly Demise', 
    'Feel No Pain', 'Fights First', 'Deep Strike', 'Scouts', 'Firing Deck', 'Pistol',
    'Hazardous', 'Blast', 'Torrent', 'Ignores Cover', 'Heavy', 'Extra Attacks', 
    'Assault', 'Devastating Wounds', 'One Shot'
  ];

  // Mots-clés qui peuvent avoir une valeur (à supprimer avec toutes leurs variantes)
  const KEYWORDS_WITH_VALUE = ['Anti-', 'Sustained Hits', 'Rapid Fire', 'Melta', 'Feel No Pain', 'Scouts', 'Deadly Demise', 'Firing Deck'];

  // Restaurer la datasheet sélectionnée depuis le localStorage si elle existe
  React.useEffect(() => {
    if (factionId) {
      const savedDatasheetId = localStorage.getItem(`selectedDatasheet_${factionId}`);
      if (savedDatasheetId && contextDatasource) {
        const factionData = contextDatasource[`${factionId}_translated`];
        if (factionData?.datasheets) {
          const datasheet = factionData.datasheets.find((ds: Datasheet) => ds.id === savedDatasheetId);
          if (datasheet) {
            setSelectedDatasheet(datasheet);
          }
        }
      }
    }
  }, [factionId, contextDatasource]);

  // Charger les données de la faction (nom et icône)
  React.useEffect(() => {
    if (contextDatasource && factionId) {
      const factionData = contextDatasource[`${factionId}_translated`];
      if (factionData) {
        // Utilise la traduction du nom de la faction si possible
        const displayName = translate(factionData.name, factionId) || factionData.name || factionId;
        setFactionName(displayName);
        setFactionIconUrl(`https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`);
      }
    }
  }, [factionId, contextDatasource]);

  // Sauvegarder la datasheet sélectionnée dans le localStorage
  const handleDatasheetSelect = (datasheet: Datasheet) => {
    setSelectedDatasheet(datasheet);
    if (factionId) {
      localStorage.setItem(`selectedDatasheet_${factionId}`, datasheet.id);
    }
  };

  const handleAddDatasheet = (datasheet: Datasheet) => {
    // Cette fonction sera utilisée si on veut ajouter la datasheet à une liste d'armée
  };

  const handleDetachmentSelect = (detachment: any) => {
    setSelectedDetachment(detachment);
    setDetachmentSelectorOpen(false);
  };

  // Fonction appelée après suppression d'une datasheet
  const handleDatasheetDeleted = () => {
    setSelectedDatasheet(null);
    if (factionId) {
      localStorage.removeItem(`selectedDatasheet_${factionId}`);
    }
    setRefreshKey(k => k + 1);
  };

  // Bouton retour - naviguer vers la homepage
  const leftAction = (
    <IconButton onClick={() => {
      navigate('/');
    }}>
      <ArrowBackIcon />
    </IconButton>
  );

  // Bouton export
  const handleExport = async () => {
    if (!factionId) return;
    const datasource = await loadDatasource();
    const files = [
      { key: `${factionId}_flat_fr`, name: `${factionId}_flat_fr.json` },
      { key: `${factionId}_flat_en`, name: `${factionId}_flat_en.json` },
      { key: `${factionId}_translated`, name: `${factionId}_translated.json` },
    ];
    files.forEach(({ key, name }) => {
      const data = datasource[key];
      if (data) {
        const fileName = name.replace(/_/g, '.');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    });
  };

  // Fonction utilitaire pour chercher récursivement une valeur dans un objet
  function isKeyUsedInTranslated(obj: any, key: string): boolean {
    if (obj === key) return true;
    if (Array.isArray(obj)) {
      return obj.some(item => isKeyUsedInTranslated(item, key));
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => isKeyUsedInTranslated(value, key));
    }
    return false;
  }

  // Fonction pour trouver toutes les occurrences d'une clé dans un objet
  const findKeyUsageLocations = (obj: any, searchKey: string, path: string = ''): string[] => {
    const locations: string[] = [];
    
    if (typeof obj === 'string' && obj === searchKey) {
      locations.push(path || 'racine');
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const newPath = path ? `${path}[${index}]` : `[${index}]`;
        locations.push(...findKeyUsageLocations(item, searchKey, newPath));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        locations.push(...findKeyUsageLocations(value, searchKey, newPath));
      });
    }
    
    return locations;
  };

  const handleCleanup = async () => {
    if (!factionId) return;
    const datasource = await loadDatasource();
    const translatedData = datasource[`${factionId}_translated`];

    if (!translatedData) return;

    // Trouver toutes les clés flat de la faction (ex: CHDA_flat_fr, CHDA_flat_en, ...)
    const flatKeys = Object.keys(datasource).filter(key => key.startsWith(`${factionId}_flat_`));
    if (flatKeys.length === 0) return;

    // On prend le premier flat pour la détection des clés inutilisées
    const flatDataRef = datasource[flatKeys[0]];
    if (!flatDataRef) return;

    const keysToRemove: string[] = [];
    const translationDataToRemove: Record<string, string> = {};
    const keyReplacements: Record<string, string> = {};
    const keyUsageLocations: Record<string, string[]> = {};
    const standardKeywordsToRemove: string[] = [];
    
    // 1. Détecter les clés inutilisées
    Object.keys(flatDataRef).forEach(key => {
      if (!isKeyUsedInTranslated(translatedData, key)) {
        keysToRemove.push(key);
        translationDataToRemove[key] = flatDataRef[key];
        keyUsageLocations[key] = [];
      }
    });

    // 2. Détecter les traductions en double (clés avec la même valeur)
    const valueToKeys: Record<string, string[]> = {};
    Object.entries(flatDataRef).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (!valueToKeys[value]) {
          valueToKeys[value] = [];
        }
        valueToKeys[value].push(key);
      }
    });

    // Pour chaque valeur, garder la clé la plus courte et supprimer les doublons
    Object.entries(valueToKeys).forEach(([value, keys]) => {
      if (keys.length > 1) {
        // Trier les clés par longueur (la plus courte en premier)
        const sortedKeys = keys.sort((a, b) => a.length - b.length);
        // Garder la clé la plus courte, supprimer les autres (plus longues)
        const keyToKeep = sortedKeys[0];
        const duplicatesToRemove = sortedKeys.slice(1);
        duplicatesToRemove.forEach(duplicateKey => {
          if (!keysToRemove.includes(duplicateKey)) {
            keysToRemove.push(duplicateKey);
            translationDataToRemove[duplicateKey] = flatDataRef[duplicateKey];
            // Stocker la correspondance pour le remplacement
            keyReplacements[duplicateKey] = keyToKeep;
            // Trouver où cette clé est utilisée dans le fichier traduit
            keyUsageLocations[duplicateKey] = findKeyUsageLocations(translatedData, duplicateKey);
          }
        });
      }
    });

    // 3. Détecter les mots-clés standards (supprimés seulement des fichiers flat)
    Object.keys(flatDataRef).forEach(key => {
      // Vérifier si c'est un mot-clé standard exact
      if (STANDARD_KEYWORDS_TO_REMOVE.includes(key)) {
        if (!standardKeywordsToRemove.includes(key)) {
          standardKeywordsToRemove.push(key);
          translationDataToRemove[key] = flatDataRef[key];
        }
      }
      
      // Vérifier si c'est un mot-clé avec valeur (commence par le mot-clé)
      KEYWORDS_WITH_VALUE.forEach(keyword => {
        if (key.startsWith(keyword) && key !== keyword) {
          if (!standardKeywordsToRemove.includes(key)) {
            standardKeywordsToRemove.push(key);
            translationDataToRemove[key] = flatDataRef[key];
          }
        }
      });
    });

    setKeysToRemove(keysToRemove);
    setTranslationDataToRemove(translationDataToRemove);
    setKeyReplacements(keyReplacements);
    setKeyUsageLocations(keyUsageLocations);
    setStandardKeywordsToRemove(standardKeywordsToRemove);
    setCleanupDialogOpen(true);
    // On stocke aussi les flatKeys pour la suite
    (window as any)._flatKeysToCleanup = flatKeys;
  };

  // Fonction récursive pour remplacer les clés dans un objet
  const replaceKeysInObject = (obj: any, replacements: Record<string, string>): any => {
    if (typeof obj === 'string') {
      // Si c'est une chaîne qui correspond à une clé à remplacer
      if (replacements[obj]) {
        return replacements[obj];
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => replaceKeysInObject(item, replacements));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        newObj[key] = replaceKeysInObject(value, replacements);
      });
      return newObj;
    }
    
    return obj;
  };

  const handleConfirmCleanup = async () => {
    if (!factionId) return;
    const datasource = await loadDatasource();
    // Récupérer les flatKeys stockées
    const flatKeys: string[] = (window as any)._flatKeysToCleanup || Object.keys(datasource).filter(key => key.startsWith(`${factionId}_flat_`));

    // 1. Supprimer les clés des fichiers flat (clés normales + mots-clés standards)
    for (const flatKey of flatKeys) {
      const flatData = datasource[flatKey];
      if (!flatData) continue;
      
      // Supprimer les clés normales
      keysToRemove.forEach(key => {
        delete flatData[key];
      });
      
      // Supprimer les mots-clés standards
      standardKeywordsToRemove.forEach(key => {
        delete flatData[key];
      });
      
      await saveDatasourceBloc(flatKey, flatData);
    }

    // 2. Remplacer les références dans le fichier traduit (seulement pour les clés normales, pas les mots-clés standards)
    const translatedData = datasource[`${factionId}_translated`];
    if (translatedData) {
      const updatedTranslatedData = replaceKeysInObject(translatedData, keyReplacements);
      await saveDatasourceBloc(`${factionId}_translated`, updatedTranslatedData);
    }

    // 3. Recharger les données dans le contexte avec un délai pour s'assurer que les fichiers sont bien écrits
    setTimeout(async () => {
      await forceReloadDatasource();
      
      // Double vérification après un court délai
      setTimeout(async () => {
        await forceReloadDatasource();
        
        // Vérification finale - recharger les données de la faction
        const updatedDatasource = await loadDatasource();
        if (updatedDatasource && factionId) {
          const factionData = updatedDatasource[`${factionId}_translated`];
          if (factionData) {
            setFactionName(factionData.name);
            setFactionIconUrl(`https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`);
          }
        }
      }, 200);
    }, 300);

    setCleanupDialogOpen(false);
    setKeysToRemove([]);
    setTranslationDataToRemove({});
    setKeyReplacements({});
    setKeyUsageLocations({});
    setStandardKeywordsToRemove([]);
    
    // Forcer plusieurs re-rendus pour s'assurer que tout se met à jour
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshKey(k => k + 1), 100);
    setTimeout(() => setRefreshKey(k => k + 1), 500);
    setTimeout(() => setRefreshKey(k => k + 1), 1000);
  };

  const rightAction = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton onClick={handleCleanup} title="Nettoyer les données">
        <CleaningServicesIcon />
      </IconButton>
      <IconButton onClick={handleExport} title="Exporter les fichiers de la faction">
        <DownloadIcon />
      </IconButton>
    </Box>
  );

  return (
    <AppLayout leftAction={leftAction} title={factionName} rightAction={rightAction}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        {/* Colonne de gauche - Liste des datasheets */}
        <Box sx={{ 
          width: isMobile ? '100%' : '350px',
          height: isMobile ? '50%' : '100%',
          borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Boutons d'action */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setFactionRulesOpen(true)}
                sx={{ flex: 1 }}
              >
                Règles d'armée
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDetachmentSelectorOpen(true)}
                sx={{ flex: 1 }}
              >
                Choisir détachement
              </Button>
            </Stack>

            {selectedDetachment && (
              <Box 
                sx={{ 
                  mt: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Détachement sélectionné
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setDetachmentDetailsOpen(true)}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    Modifier
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {translate(selectedDetachment.name, factionId || '')}
                </Typography>
              </Box>
            )}
          </Box>

          <DatasheetList
            factionId={factionId || ''}
            onSelectDatasheet={handleDatasheetSelect}
            onAdd={handleAddDatasheet}
            selectedItem={selectedDatasheet ? { type: 'datasheet', id: selectedDatasheet.id } : null}
            refreshKey={refreshKey}
          />
        </Box>

        {/* Zone principale - Carte d'unité */}
        <Box sx={{ 
          flex: 1,
          height: isMobile ? '50%' : '100%',
          overflow: 'auto',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 2
        }}>
          {selectedDatasheet ? (
            <Box sx={{ 
              width: '100%',
              maxWidth: '1080px',
              mx: 'auto'
            }}>
              <UnitCard
                unit={selectedDatasheet}
                army={{
                  faction: factionName,
                  factionId: factionId
                }}
                isBattleMode={false}
                onUnitDeleted={handleDatasheetDeleted}
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              width: '100%'
            }}>
              <Box sx={{ 
                textAlign: 'center',
                color: 'text.secondary',
                p: 2
              }}>
                Sélectionnez une unité pour voir ses détails
              </Box>
            </Box>
          )}
        </Box>

        {/* Modales */}
        <FactionRules
          open={factionRulesOpen}
          onClose={() => setFactionRulesOpen(false)}
          factionId={factionId || ''}
          factionName={factionName}
          iconUrl={factionIconUrl}
        />

        <DetachmentSelector
          open={detachmentSelectorOpen}
          onClose={() => setDetachmentSelectorOpen(false)}
          onSelect={handleDetachmentSelect}
          factionId={factionId || ''}
          factionName={factionName}
          currentDetachment={selectedDetachment?.name}
        />

        {selectedDetachment && (
          <DetachmentDetails
            open={detachmentDetailsOpen}
            onClose={() => setDetachmentDetailsOpen(false)}
            detachment={selectedDetachment}
            faction={{
              id: factionId || '',
              name: factionName,
              iconUrl: factionIconUrl
            }}
          />
        )}

        <CleanupDialog
          open={cleanupDialogOpen}
          onClose={() => setCleanupDialogOpen(false)}
          keysToRemove={keysToRemove}
          translationData={translationDataToRemove}
          keyReplacements={keyReplacements}
          keyUsageLocations={keyUsageLocations}
          standardKeywordsToRemove={standardKeywordsToRemove}
          onConfirm={handleConfirmCleanup}
        />
      </Box>
    </AppLayout>
  );
};

export default FactionView; 