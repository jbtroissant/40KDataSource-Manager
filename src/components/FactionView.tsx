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

  React.useEffect(() => {
    const loadFactionData = async () => {
      const datasource = await loadDatasource();
      if (datasource && factionId) {
        const factionData = datasource[`${factionId}_translated`];
        if (factionData) {
          setFactionName(factionData.name);
          setFactionIconUrl(`https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`);
        }
      }
    };
    loadFactionData();
  }, [factionId]);

  const handleDatasheetSelect = (datasheet: Datasheet) => {
    setSelectedDatasheet(datasheet);
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
    setRefreshKey(k => k + 1);
  };

  // Bouton retour
  const leftAction = (
    <IconButton onClick={() => navigate('/')}>
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
    Object.keys(flatDataRef).forEach(key => {
      if (!isKeyUsedInTranslated(translatedData, key)) {
        keysToRemove.push(key);
      }
    });

    setKeysToRemove(keysToRemove);
    setCleanupDialogOpen(true);
    // On stocke aussi les flatKeys pour la suite
    (window as any)._flatKeysToCleanup = flatKeys;
  };

  const handleConfirmCleanup = async () => {
    if (!factionId) return;
    const datasource = await loadDatasource();
    // Récupérer les flatKeys stockées
    const flatKeys: string[] = (window as any)._flatKeysToCleanup || Object.keys(datasource).filter(key => key.startsWith(`${factionId}_flat_`));

    for (const flatKey of flatKeys) {
      const flatData = datasource[flatKey];
      if (!flatData) continue;
      keysToRemove.forEach(key => {
        delete flatData[key];
      });
      await saveDatasourceBloc(flatKey, flatData);
    }

    setCleanupDialogOpen(false);
    setKeysToRemove([]);
    setRefreshKey(k => k + 1); // Pour rafraîchir la liste
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
          onConfirm={handleConfirmCleanup}
        />
      </Box>
    </AppLayout>
  );
};

export default FactionView; 