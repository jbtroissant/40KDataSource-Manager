import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
  Snackbar,
  Alert,
  Typography,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Datasheet } from '../../types/datasheet';
import { loadDatasource, saveDatasourceBloc } from '../../utils/datasourceDb';
import StructureEditor from './StructureEditor';
import TranslationEditor from './TranslationEditor';
import { datasheetEditorService } from '../../services/datasheetEditorService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`datasheet-tabpanel-${index}`}
      aria-labelledby={`datasheet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DatasheetEditor: React.FC = () => {
  const { factionId, datasheetId } = useParams<{ factionId: string; datasheetId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editedDatasheet, setEditedDatasheet] = useState<Datasheet | null>(null);
  const [frTranslations, setFrTranslations] = useState<Record<string, string>>({});
  const [enTranslations, setEnTranslations] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!factionId || !datasheetId) return;

      try {
        const datasource = await loadDatasource();
        const factionKey = `${factionId}_translated`;
        const flatFrKey = `${factionId}_flat_fr`;
        const flatEnKey = `${factionId}_flat_en`;

        // Charger la datasheet
        const datasheet = datasource[factionKey]?.datasheets?.find(
          (ds: Datasheet) => ds.id === datasheetId
        );

        if (!datasheet) {
          setErrors(['Datasheet non trouvée']);
          setShowErrors(true);
          return;
        }

        setEditedDatasheet(datasheet);

        // Charger les traductions
        const frTranslations = datasource[flatFrKey] || {};
        const enTranslations = datasource[flatEnKey] || {};

        setFrTranslations(frTranslations);
        setEnTranslations(enTranslations);
      } catch (error) {
        setErrors(['Erreur lors du chargement des données']);
        setShowErrors(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [factionId, datasheetId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStructureChange = (newDatasheet: Datasheet) => {
    setEditedDatasheet(newDatasheet);
  };

  const handleTranslationChange = (language: 'fr' | 'en', translations: Record<string, string>) => {
    if (language === 'fr') {
      setFrTranslations(translations);
    } else {
      setEnTranslations(translations);
    }
  };

  const validateDatasheet = (): string[] => {
    if (!editedDatasheet) return ['Aucune datasheet à valider'];
    
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!editedDatasheet.id) {
      errors.push("L'ID est obligatoire");
    }
    if (!editedDatasheet.faction_id) {
      errors.push("L'ID de faction est obligatoire");
    }

    // Validation des statistiques
    if (editedDatasheet.stats.length === 0) {
      errors.push('Au moins une statistique est requise');
    }

    // Validation des points
    if (editedDatasheet.points.length === 0) {
      errors.push('Au moins un point est requis');
    }

    return errors;
  };

  const handleSave = async () => {
    if (!editedDatasheet || !factionId) return;

    const structureErrors = validateDatasheet();
    const frTranslationErrors = datasheetEditorService.validateTranslations(editedDatasheet, frTranslations);
    const enTranslationErrors = datasheetEditorService.validateTranslations(editedDatasheet, enTranslations);
    const errors = [
      ...structureErrors.map(e => `Erreur structure : ${e}`),
      ...frTranslationErrors,
      ...enTranslationErrors
    ];

    if (errors.length > 0) {
      setErrors(errors);
      setShowErrors(true);
      return;
    }

    try {
      const datasource = await loadDatasource();
      const factionKey = `${factionId}_translated`;
      const flatFrKey = `${factionId}_flat_fr`;
      const flatEnKey = `${factionId}_flat_en`;

      // Sauvegarder la datasheet
      if (datasource[factionKey]?.datasheets) {
        const index = datasource[factionKey].datasheets.findIndex(
          (ds: Datasheet) => ds.id === editedDatasheet.id
        );
        if (index !== -1) {
          datasource[factionKey].datasheets[index] = editedDatasheet;
        }
        await saveDatasourceBloc(factionKey, datasource[factionKey]);
      }

      // Sauvegarder les traductions
      await saveDatasourceBloc(flatFrKey, frTranslations);
      await saveDatasourceBloc(flatEnKey, enTranslations);

      // Rediriger vers la vue de la faction
      navigate(`/faction/${factionId}`);
    } catch (error) {
      setErrors(['Erreur lors de la sauvegarde']);
      setShowErrors(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!editedDatasheet) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Datasheet non trouvée
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ top: 0, zIndex: 1200 }}>
        <Toolbar>
          <Button color="primary" variant="contained" onClick={() => navigate(`/faction/${editedDatasheet.faction_id}`)} sx={{ mr: 2 }}>
            Retour
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Éditeur de fiche
          </Typography>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 1100, bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="datasheet tabs">
          <Tab label="Structure" />
          <Tab label="Traductions FR" />
          <Tab label="Traductions EN" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <StructureEditor datasheet={editedDatasheet} onChange={handleStructureChange} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <TranslationEditor
          datasheet={editedDatasheet}
          factionId={factionId || ''}
          language="fr"
          onChange={(translations) => handleTranslationChange('fr', translations)}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TranslationEditor
          datasheet={editedDatasheet}
          factionId={factionId || ''}
          language="en"
          onChange={(translations) => handleTranslationChange('en', translations)}
        />
      </TabPanel>

      <Snackbar
        open={showErrors}
        autoHideDuration={6000}
        onClose={() => setShowErrors(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowErrors(false)} severity="error" sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {errors.map((error, index) => (
              <Typography key={index}>{error}</Typography>
            ))}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DatasheetEditor; 