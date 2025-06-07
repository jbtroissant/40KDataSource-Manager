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
  AccordionDetails
} from '@mui/material';
import { ArmyRule } from '../types/army';
import { TextFormatService } from '../services/textFormatService';
import CloseIcon from '@mui/icons-material/Close';
import { loadDatasource } from '../utils/datasourceDb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslate } from '../services/translationService';

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

  const handleAccordionChange = (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isMobile) {
      setExpandedSections(prev => 
        isExpanded 
          ? [...prev, panel]
          : prev.filter(section => section !== panel)
      );
    }
  };

  if (!open) return null;

  if (isMobile) {
    return (
      <Box sx={{
        position: 'fixed',
        top: '56px',
        left: 0,
        width: '100vw',
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        m: 0,
        borderRadius: 0,
        maxWidth: '1080px',
        mx: 'auto',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}>
        {/* En-tête avec bouton retour et nom de la faction */}
        <Box sx={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          color: 'text.primary',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          px: 1,
          boxShadow: 1,
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          justifyContent: 'center',
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.primary',
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              width: '100%',
              px: 4,
            }}
          >
            {translate(factionName, factionId)}
          </Typography>
        </Box>

        {/* Contenu principal scrollable */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(30px)',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
            {rules.length > 0 ? (
              rules
                .sort((a, b) => a.order - b.order)
                .map((rule, index) => (
                  <Accordion
                    key={index}
                    expanded={expandedSections.includes(index)}
                    onChange={handleAccordionChange(index)}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.2)'
                        : 'rgba(255, 255, 255, 0.2)',
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }}/>}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{translate(rule.name, factionId)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {rule.rule.map((subRule, subIndex) => (
                        <Box key={subIndex} sx={{ mb: subIndex < rule.rule.length - 1 ? 2 : 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ mb: 1, fontWeight: 'bold' }}
                          >
                            {translate(subRule.name, factionId)}
                          </Typography>
                          <Typography sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                            {TextFormatService.formatRuleText(translate(subRule.text, factionId))}
                          </Typography>
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
          </Box>
        </Box>
      </Box>
    );
  }

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
                    sx={{ 
                      cursor: 'default',
                      '&:hover': {
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{translate(rule.name, factionId)}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {rule.rule.map((subRule, subIndex) => (
                      <Box key={subIndex} sx={{ mb: subIndex < rule.rule.length - 1 ? 2 : 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ mb: 1, fontWeight: 'bold' }}
                        >
                          {translate(subRule.name, factionId)}
                        </Typography>
                        <Typography sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                          {TextFormatService.formatRuleText(translate(subRule.text, factionId))}
                        </Typography>
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FactionRules; 