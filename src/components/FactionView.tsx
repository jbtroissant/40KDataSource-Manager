import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Button, Stack, Typography, IconButton } from '@mui/material';
import DatasheetList from './CoreComponents/DatasheetList';
import UnitCard from './UnitView/UnitCard';
import FactionRules from './FactionRules';
import DetachmentSelector from './DetachmentSelector';
import DetachmentDetails from './DetachmentDetails';
import { Datasheet } from '../types/datasheet';
import { useParams, useNavigate } from 'react-router-dom';
import { loadDatasource } from '../utils/datasourceDb';
import { useTranslate } from '../services/translationService';
import AppLayout from './AppLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

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
    console.log('Datasheet ajoutée:', datasheet);
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

  const rightAction = (
    <IconButton onClick={handleExport} title="Exporter les fichiers de la faction">
      <DownloadIcon />
    </IconButton>
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
      </Box>
    </AppLayout>
  );
};

export default FactionView; 