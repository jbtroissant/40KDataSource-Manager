import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box,
  useTheme,
  IconButton,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField
} from '@mui/material';
import { ArmyRule } from '../types/army';
import { TextFormatService } from '../services/textFormatService';
import CloseIcon from '@mui/icons-material/Close';
import { loadDatasource, saveDatasourceBloc, loadDatasourceBloc } from '../utils/datasourceDb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslate } from '../services/translationService';
import EditableSection from './UnitView/EditableSection';
import ReactMarkdown from 'react-markdown';

interface FactionRulesProps {
  open: boolean;
  onClose: () => void;
  factionId: string;
  factionName: string;
  iconUrl?: string;
}

const FactionRules: React.FC<FactionRulesProps> = ({ open, onClose, factionId, factionName, iconUrl }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rules, setRules] = useState<ArmyRule[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const { lang } = useLanguage();
  const [datasource, setDatasource] = useState<any>(null);
  const translate = useTranslate();
  const [addMode, setAddMode] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleText, setNewRuleText] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (open && factionId) {
      const fetchRules = async () => {
        const datasource = await loadDatasource();
        setDatasource(datasource);
        
        let factionData = null;
        // Chercher d'abord dans la version traduite
        factionData = datasource[`${factionId}_translated`];
        
        // Si pas trouvé, chercher dans les autres versions
        if (!factionData) {
          for (const key in datasource) {
            if (datasource[key].id === factionId) {
              factionData = datasource[key];
              break;
            }
          }
        }
        
        let allRules: ArmyRule[] = [];
        if (factionData && factionData.rules && factionData.rules.army)
          allRules = factionData.rules.army;
        setRules(allRules);
        // Initialiser toutes les sections comme ouvertes
        setExpandedSections(allRules.map((_, index) => index));
      };
      fetchRules();
    }
  }, [open, factionId, lang]);

  const handleAddRule = async () => {
    setAddError('');
    if (!newRuleTitle.trim() || !newRuleText.trim()) {
      setAddError('Les deux champs sont obligatoires.');
      return;
    }
    // Générer un slug pour la clé
    const slug = newRuleTitle.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
    const nameKey = `rules.army.${slug}.name`;
    const textKey = `rules.army.${slug}.rule.0.text`;
    // Persister dans le flat de la faction courante ET dans les autres langues
    const languages = ['fr', 'en'];
    for (const l of languages) {
      const flatKey = `${factionId}_flat_${l}`;
      let bloc = datasource[flatKey] || {};
      bloc = {
        ...bloc,
        [nameKey]: l === lang ? newRuleTitle : nameKey,
        [textKey]: l === lang ? newRuleText : textKey,
      };
      await saveDatasourceBloc(flatKey, bloc);
      // Mettre à jour le datasource local pour éviter les incohérences
      datasource[flatKey] = bloc;
    }
    setDatasource({ ...datasource });

    // Sauvegarder dans le format structuré de la faction
    const factionKey = `${factionId}_translated`;
    let factionBloc = datasource[factionKey] || {};
    if (!factionBloc.rules) {
      factionBloc.rules = { army: [] };
    }
    if (!factionBloc.rules.army) {
      factionBloc.rules.army = [];
    }
    
    const newArmyRule: ArmyRule = {
      name: nameKey, // clé de traduction
      order: rules.length,
      rule: [
        {
          order: 0,
          text: textKey, // clé de traduction
          type: 'text',
        },
      ],
    };
    
    factionBloc.rules.army = [...factionBloc.rules.army, newArmyRule];
    await saveDatasourceBloc(factionKey, factionBloc);
    setDatasource({ ...datasource, [factionKey]: factionBloc });

    // Mettre à jour l'état local
    setRules([...rules, newArmyRule]);
    setAddMode(false);
    setNewRuleTitle('');
    setNewRuleText('');
  };

  if (!open) return null;

  // Version desktop
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'transparent',
        backdropFilter: 'blur(10px)',
        minHeight: 56,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {iconUrl && (
            <Box
              component="img"
              src={iconUrl}
              alt={translate(factionName, factionId)}
              sx={{
                width: 32,
                height: 32,
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
              }}
            />
          )}
          <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            {translate(factionName, factionId)}
          </Typography>
        </Box>
        <IconButton
          edge="end" 
          onClick={onClose} 
          aria-label="close"
          sx={{ color: 'text.primary', ml: 'auto' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        p: 3,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.08)' 
            : 'rgba(0,0,0,0.08)',
          borderRadius: '4px',
          transition: 'background 0.2s',
          '&:hover': {
            background: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.18)' 
              : 'rgba(0, 0, 0, 0.18)',
          },
        },
      }}>
        <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rules.length > 0 ? (
            rules
              .sort((a, b) => a.order - b.order)
              .map((rule, index) => (
                <Accordion
                  key={index}
                  expanded={true}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary 
                    component="div"
                    sx={{ 
                      cursor: 'default',
                      '&:hover': {
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    <EditableSection
                      content={rule.name}
                      factionId={factionId}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    {rule.rule.map((subRule, subIndex) => (
                      <Box key={subIndex} sx={{ mb: subIndex < rule.rule.length - 1 ? 2 : 0 }}>
                        <EditableSection
                          content={subRule.text}
                          factionId={factionId}
                        />
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))
          ) : (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Aucune règle d'armée disponible pour cette faction.
            </Typography>
          )}
          {addMode ? (
            <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Ajouter une règle d'armée</Typography>
              <TextField
                label="Titre de la règle"
                value={newRuleTitle}
                onChange={e => setNewRuleTitle(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Texte de la règle"
                value={newRuleText}
                onChange={e => setNewRuleText(e.target.value)}
                fullWidth
                required
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
              {addError && <Typography color="error" sx={{ mb: 1 }}>{addError}</Typography>}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={handleAddRule}>Ajouter</Button>
                <Button variant="outlined" onClick={() => { setAddMode(false); setAddError(''); }}>Annuler</Button>
              </Box>
            </Box>
          ) : (
            <Button variant="outlined" color="primary" sx={{ mt: 2, mb: 2, color: 'text.primary' }} onClick={() => setAddMode(true)}>
              Ajouter une règle d'armée
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FactionRules; 