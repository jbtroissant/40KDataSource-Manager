import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import StratagemCard from './StratagemCard';
import { Rule } from '../types/rule';
import { TextFormatService } from '../services/textFormatService';
import StratagemListItem from './CoreComponents/StratagemListItem';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslate } from '../services/translationService';
import EditableSection from './UnitView/EditableSection';

interface ArmyRule {
  name: string;
  rule: Rule[];
}

interface Faction {
  id: string;
  name: string;
  iconUrl: string;
  is_subfaction?: boolean;
  parent_id?: string;
  subfactions?: Faction[];
  rules?: {
    army?: ArmyRule[];
  };
}

interface DetachmentDetailsProps {
  open: boolean;
  onClose: () => void;
  detachment: {
    name: string;
    rules: Array<{
      name: string;
      rule: Rule[];
    }>;
    enhancements: Array<{
      name: string;
      cost: string;
      description: string;
      keywords: string[];
      excludes: string[];
      faction_id: string;
      id: string;
      cardType: string;
      source: string;
    }>;
    stratagems: Array<{
      name: string;
      cost: number;
      effect: string;
      faction_id: string;
      fluff: string;
      id: string;
      phase: string[];
      restrictions: string;
      target: string;
      turn: string;
      type: string;
      when: string;
    }>;
  };
  faction: Faction;
}

const RuleCard: React.FC<{
  name: string;
  rules: Rule[];
  factionId?: string;
  datasource?: any;
  lang?: 'fr' | 'en';
}> = ({ name, rules, factionId, lang }) => {
  const theme = useTheme();
  const translate = useTranslate();
  return (
    <Card sx={{ 
      bgcolor: theme.palette.mode === 'dark'
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.2)',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
    }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: 'text.primary'
        }}>
          {factionId ? translate(name, factionId) : name}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {(rules || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((rule, idx) => {
              if (rule.type === 'header') {
                return (
                  <Typography 
                    key={idx} 
                    variant="subtitle2" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      mt: idx > 0 ? 2 : 0
                    }}
                  >
                    {factionId ? translate(rule.text || '', factionId) : rule.text}
                  </Typography>
                );
              }
              // Fallback pour le texte de la règle
              let translated = factionId && rule.text
                ? translate(rule.text, factionId)
                : '';
              let toDisplay = translated && translated !== rule.text ? translated : rule.text || '';
              return (
                <Typography 
                  key={idx} 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {TextFormatService.formatRuleText(toDisplay)}
                </Typography>
              );
            })}
        </Box>
      </CardContent>
    </Card>
  );
};

const ArmyRulesDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  faction: Faction;
}> = ({ open, onClose, faction }) => {
  const theme = useTheme();
  const translate = useTranslate();
  const getArmyRules = () => {
    return faction.rules?.army || [];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.2)',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2,
        bgcolor: 'transparent'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {translate(faction.name, faction.id)}
        </Typography>
        </Box>
        <IconButton 
          edge="end" 
          onClick={onClose} 
          aria-label="close"
          sx={{ color: 'text.primary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2 
        }}>
          {getArmyRules().map((armyRule: ArmyRule, index: number) => (
            <RuleCard
              key={`army-${index}`}
              name={armyRule.name}
              rules={armyRule.rule}
            />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const DetachmentDetails: React.FC<DetachmentDetailsProps> = ({ open, onClose, detachment, faction }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [armyRulesOpen, setArmyRulesOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['rules', 'enhancements', 'stratagems']);
  const [selectedStratagem, setSelectedStratagem] = useState<any | null>(null);
  const { lang } = useLanguage();
  const [datasource, setDatasource] = useState<any>(null);
  const translate = useTranslate();
  const [editState, setEditState] = useState({});

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(section => section !== panel)
    );
  };

  useEffect(() => {
    async function fetchData() {
      const ds = await import('../utils/datasourceDb').then(m => m.loadDatasource());
      setDatasource(ds);
    }
    fetchData();
  }, []);

  const handleSectionSave = (newContent: any, section?: string) => {
    const updatedDetachment = { ...detachment };
    
    if (section && section.startsWith('stratagem_')) {
      const stratagemIndex = parseInt(section.split('_')[1]);
      const field = section.split('_')[2];
      updatedDetachment.stratagems[stratagemIndex] = {
        ...updatedDetachment.stratagems[stratagemIndex],
        [field]: newContent
      };
    } else if (section) {
      switch (section) {
        case 'name':
          updatedDetachment.name = newContent;
          break;
        // ... autres cas existants ...
      }
    }
    
    // Sauvegarder dans le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === faction.id);
    if (army) {
      const detachmentIndex = army.detachments.findIndex((d: any) => d.name === detachment.name);
      if (detachmentIndex !== -1) {
        army.detachments[detachmentIndex] = updatedDetachment;
        localStorage.setItem('army_list', JSON.stringify(armies));
      }
    }
    
    setEditState({});
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
        backdropFilter: 'blur(10px)',
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
        {/* En-tête avec bouton retour et nom du détachement */}
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
            {datasource ? translate(detachment.name, faction.id) : detachment.name}
          </Typography>
        </Box>

        {/* Contenu principal scrollable */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          minHeight: 0,
          backdropFilter: 'blur(10px)',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* Règles du détachement */}
            <Accordion 
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
              expanded={expandedSections.includes('rules')} 
              onChange={handleAccordionChange('rules')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }}/>}>
                <Typography variant="h6">Règles du détachement</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {detachment.rules ? (
                  detachment.rules.map((rule, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <EditableSection
                        content={rule.name}
                        onSave={handleSectionSave}
                      />
                      <EditableSection
                        content={rule.rule[0]?.text || ''}
                        onSave={handleSectionSave}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aucune règle de détachement disponible.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Améliorations */}
            <Accordion 
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
              expanded={expandedSections.includes('enhancements')} 
              onChange={handleAccordionChange('enhancements')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }}/>}>
                <Typography variant="h6">Améliorations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {detachment.enhancements.map((enhancement, index) => (
                    <Card
                      key={index}
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Box sx={{  
                          display: 'grid',
                          gridTemplateColumns: '10fr 2fr',
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: 1 
                        }}>
                          <EditableSection
                            content={enhancement.name}
                            onSave={handleSectionSave}
                          />
                          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            {enhancement.cost} Pts
                          </Typography>
                        </Box>
                        <EditableSection
                          content={enhancement.description}
                          onSave={handleSectionSave}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {enhancement.keywords.map((keyword: string, idx: number) => (
                            <Typography
                              key={idx}
                              variant="caption"
                              sx={{
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                px: 1,
                                borderRadius: 1,
                                mr: 1
                              }}
                            >
                              {keyword}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Stratagèmes */}
            <Accordion 
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
              expanded={expandedSections.includes('stratagems')} 
              onChange={handleAccordionChange('stratagems')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }}/>}>
                <Typography variant="h6">Stratagèmes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {detachment.stratagems.map((stratagem, index) => (
                    <Card
                      key={index}
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        maxHeight: 'none',
                        height: 'auto',
                        overflow: 'visible',
                      }}
                    >
                      <CardContent
                        sx={{
                          maxHeight: 'none',
                          height: 'auto',
                          overflow: 'visible',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Box sx={{  
                          display: 'grid',
                          gridTemplateColumns: '10fr 2fr',
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: 1 
                        }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {translate('Nom du stratagème', '')}
                            </Typography>
                            <EditableSection
                              content={stratagem.name}
                              onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_name`)}
                            />
                          </Box>
                          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            {stratagem.cost} CP
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {translate('Effet', '')}
                            </Typography>
                            <EditableSection
                              content={stratagem.effect}
                              onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_effect`)}
                            />
                          </Box>

                          {stratagem.fluff && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {translate('Description', '')}
                              </Typography>
                              <EditableSection
                                content={stratagem.fluff}
                                onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_fluff`)}
                              />
                            </Box>
                          )}

                          {stratagem.when && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {translate('Quand utiliser', '')}
                              </Typography>
                              <EditableSection
                                content={stratagem.when}
                                onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_when`)}
                              />
                            </Box>
                          )}

                          {stratagem.target && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {translate('Cible', '')}
                              </Typography>
                              <EditableSection
                                content={stratagem.target}
                                onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_target`)}
                              />
                            </Box>
                          )}

                          {stratagem.restrictions && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {translate('Restrictions', '')}
                              </Typography>
                              <EditableSection
                                content={stratagem.restrictions}
                                onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_restrictions`)}
                              />
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {stratagem.phase && stratagem.phase.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                px: 1,
                                borderRadius: 1,
                                mr: 1
                              }}
                            >
                              {translate('Phase', '')}: {stratagem.phase.map(p => translate(p, '')).join(', ')}
                            </Typography>
                          )}

                          {stratagem.turn && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                px: 1,
                                borderRadius: 1,
                                mr: 1
                              }}
                            >
                              {translate('Tour', '')}: {translate(stratagem.turn, '')}
                            </Typography>
                          )}

                          {stratagem.type && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                px: 1,
                                borderRadius: 1,
                                mr: 1
                              }}
                            >
                              {translate('Type', '')}: {translate(stratagem.type, '')}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>

        {/* Overlay pour le détail du stratagème sélectionné */}
        {selectedStratagem && (
          <StratagemCard
            stratagem={selectedStratagem}
            open={!!selectedStratagem}
            onClose={() => setSelectedStratagem(null)}
          />
        )}

        <ArmyRulesDialog
          open={armyRulesOpen}
          onClose={() => setArmyRulesOpen(false)}
          faction={faction}
        />
      </Box>
    );
  }

  // Version desktop
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
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
          maxWidth: '98vw',
          width: '98vw',
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
      }}>
        <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          {translate(detachment.name, faction.id)}
        </Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="close"
          sx={{ color: 'text.primary', ml: 'auto' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Contenu */}
      <DialogContent sx={{ 
        p: 3,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ mt: 3, display: 'flex', gap: 3, width: '100%' }}>
          {/* Section de gauche : Règles du détachement */}
          <Box sx={{ 
            width: '25%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
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
            <Typography variant="h6" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              Règles du détachement
            </Typography>
            <Box sx={{ 
              p: 2, 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
            }}>
              {detachment.rules ? (
                detachment.rules.map((rule, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <EditableSection
                      content={rule.name}
                      onSave={handleSectionSave}
                    />
                    <EditableSection
                      content={rule.rule[0]?.text || ''}
                      onSave={handleSectionSave}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Aucune règle de détachement disponible.
                </Typography>
              )}
            </Box>
          </Box>

          {/* Section du milieu : Améliorations */}
          <Box sx={{ 
            width: '25%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
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
            <Typography variant="h6" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              Améliorations
            </Typography>
            <Box sx={{ 
              p: 2, 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {detachment.enhancements.map((enhancement, index) => (
                  <Card
                    key={index}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Box sx={{  
                        display: 'grid',
                        gridTemplateColumns: '10fr 2fr',
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1 
                      }}>
                        <EditableSection
                          content={enhancement.name}
                          onSave={handleSectionSave}
                        />
                        <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                          {enhancement.cost} Pts
                        </Typography>
                      </Box>
                      <EditableSection
                        content={enhancement.description}
                        onSave={handleSectionSave}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {enhancement.keywords.map((keyword: string, idx: number) => (
                          <Typography
                            key={idx}
                            variant="caption"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                              px: 1,
                              borderRadius: 1,
                              mr: 1
                            }}
                          >
                            {keyword}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Section de droite : Stratagèmes en grille */}
          <Box sx={{ 
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            maxHeight: '70vh',
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
            <Typography variant="h6" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              Stratagèmes
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridAutoRows: '1fr',
              gap: 2,
              p: 2,
              width: '100%',
              maxHeight: 'calc(3 * 260px + 2 * 16px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.08)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(0,0,0,0.18)',
              },
            }}>
              {detachment.stratagems.map((stratagem, index) => (
                <Card
                  key={index} 
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    maxHeight: 'none',
                    height: 'auto',
                    overflow: 'visible',
                  }}
                >
                  <CardContent
                    sx={{
                      maxHeight: 'none',
                      height: 'auto',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Box sx={{  
                      display: 'grid',
                      gridTemplateColumns: '10fr 2fr',
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 1 
                    }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {translate('Nom du stratagème', '')}
                        </Typography>
                        <EditableSection
                          content={stratagem.name}
                          onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_name`)}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                        {stratagem.cost} CP
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {translate('Effet', '')}
                        </Typography>
                        <EditableSection
                          content={stratagem.effect}
                          onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_effect`)}
                        />
                      </Box>

                      {stratagem.fluff && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {translate('Description', '')}
                          </Typography>
                          <EditableSection
                            content={stratagem.fluff}
                            onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_fluff`)}
                          />
                        </Box>
                      )}

                      {stratagem.when && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {translate('Quand utiliser', '')}
                          </Typography>
                          <EditableSection
                            content={stratagem.when}
                            onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_when`)}
                          />
                        </Box>
                      )}

                      {stratagem.target && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {translate('Cible', '')}
                          </Typography>
                          <EditableSection
                            content={stratagem.target}
                            onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_target`)}
                          />
                        </Box>
                      )}

                      {stratagem.restrictions && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {translate('Restrictions', '')}
                          </Typography>
                          <EditableSection
                            content={stratagem.restrictions}
                            onSave={(newContent) => handleSectionSave(newContent, `stratagem_${index}_restrictions`)}
                          />
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {stratagem.phase && stratagem.phase.length > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                            px: 1,
                            borderRadius: 1,
                            mr: 1
                          }}
                        >
                          {translate('Phase', '')}: {stratagem.phase.map(p => translate(p, '')).join(', ')}
                        </Typography>
                      )}

                      {stratagem.turn && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                            px: 1,
                            borderRadius: 1,
                            mr: 1
                          }}
                        >
                          {translate('Tour', '')}: {translate(stratagem.turn, '')}
                        </Typography>
                      )}

                      {stratagem.type && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                            px: 1,
                            borderRadius: 1,
                            mr: 1
                          }}
                        >
                          {translate('Type', '')}: {translate(stratagem.type, '')}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {selectedStratagem && (
        <StratagemCard
          open={!!selectedStratagem}
          onClose={() => setSelectedStratagem(null)}
          stratagem={selectedStratagem}
        />
      )}

      <ArmyRulesDialog
        open={armyRulesOpen}
        onClose={() => setArmyRulesOpen(false)}
        faction={faction}
      />
    </Dialog>
  );
};

export default DetachmentDetails; 