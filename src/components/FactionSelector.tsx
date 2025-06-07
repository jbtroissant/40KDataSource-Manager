import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  TextField,
  Card,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import { 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Army } from '../types/army';
import FactionRules from './FactionRules';
import { loadDatasource } from '../utils/datasourceDb';
import { APP_VERSION } from '../config';
// @ts-ignore
import packageJson from '../../package.json';
import { useTranslate } from '../services/translationService';
import ActionButton from './CoreComponents/ActionButton';

interface FactionSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (factionId: string) => void;
}

interface Faction {
  id: string;
  name: string;
  iconUrl: string;
  is_subfaction?: boolean;
  parent_id?: string;
  subfactions?: Faction[];
  rules?: {
    detachment?: Array<{
      name: string;
      detachment: string;
    }>;
    army?: any[];
    detachment_rules?: {
      [key: string]: {
        detachment: string;
        description: string;
      };
    };
    enhancements?: {
      [key: string]: {
        detachment: string;
        description: string;
      };
    };
    stratagems?: {
      [key: string]: {
        detachment: string;
        description: string;
      };
    };
  };
}

const FactionSelector: React.FC<FactionSelectorProps> = ({ open, onClose, onSelect }) => {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [listName, setListName] = useState('');
  const [armyRulesOpen, setArmyRulesOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [datasource, setDatasource] = useState<any>(null);
  const translate = useTranslate();

  useEffect(() => {
    const fetchFactions = async () => {
      const datasourceStr = await loadDatasource();
      setDatasource(datasourceStr);
      if (datasourceStr)
        try {
          const datasource = datasourceStr;
          const allFactions: Faction[] = Object.entries(datasource)
            .filter(([key, data]: [string, any]) => key.endsWith('_translated'))
            .map(([key, data]: [string, any]) => ({
              id: data.id || key.replace('_translated', ''),
              name: data.name || key.replace('_translated', ''),
              iconUrl: data.id === 'UN' 
                ? './icons/wh40k/General/rogue-trader.svg'
                : `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${data.id}.svg`,
              is_subfaction: data.is_subfaction || false,
              parent_id: data.parent_id || '',
              subfactions: [],
              rules: data.rules || {}
            }));
          const mainFactions = allFactions.filter(f => !f.is_subfaction);
          const subfactions = allFactions.filter(f => f.is_subfaction);
          subfactions.forEach(subfaction => {
            if (subfaction.parent_id) {
              const parentFaction = mainFactions.find(f => f.id === subfaction.parent_id);
              if (parentFaction) {
                parentFaction.subfactions = parentFaction.subfactions || [];
                parentFaction.subfactions.push(subfaction);
              }
            }
          });
          setFactions(mainFactions);
        } catch (error) {}
    };
    if (open) {
      fetchFactions();
    }
  }, [open]);

  const handleFactionClick = (factionId: string) => {
    const faction = findFactionById(factionId, factions);
    if (faction) {
      setSelectedFaction(faction);
    }
  };

  const findFactionById = (id: string, factionList: Faction[]): Faction | null => {
    for (const faction of factionList) {
      if (faction.id === id) return faction;
      if (faction.subfactions) {
        const found = findFactionById(id, faction.subfactions);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreate = async () => {
    if (selectedFaction) {
      const existingArmies: Army[] = JSON.parse(localStorage.getItem('army_list') || '[]');
      const armyVersion = APP_VERSION === 'dev' ? (packageJson.version || 'dev') : APP_VERSION;
      const newArmy: Army = {
        armyId: crypto.randomUUID(),
        name: listName || `${selectedFaction.name}`,
        points: 0,
        faction: selectedFaction.name,
        factionId: selectedFaction.id,
        chapter: '',
        units: [],
        armyRule: [{
          name: selectedFaction.name,
          rule: [{
            name: selectedFaction.name,
            text: selectedFaction.rules?.army?.join(', ') || ''
          }],
          order: 0
        }],
        detachment: {
          detachment: '',
          name: '',
          description: '',
          rules: [],
          stratagems: [],
          enhancements: []
        },
        importDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: armyVersion
      };
      existingArmies.push(newArmy);
      localStorage.setItem('army_list', JSON.stringify(existingArmies));
      onSelect(selectedFaction.id);
      onClose();
      window.location.href = `/army-builder/${newArmy.armyId}`;
    }
  };

  const getFactionImage = (id: string) => `/images/factions/${id}.png`;

  const renderFactionSelection = () => {
    // Remplacer les listes de noms par des listes d'id
    const imperiumList = [
      'AS', 'AC', 'AdM', 'AM', 'CHBT','CHBA', 'CHDA', 'DG', 'GK', 'AoI','QI', 'SM', 'CHSW'
    ];
    const chaosList = [
      'CD', 'QT', 'CSM', 'LGEC', 'WE', 'TS'
    ];
    const xenosList = [
      'AE', 'DRU', 'GSC', 'HQ', 'LoV', 'NEC','ORK', 'TAU', 'TYR'
    ];

    // On aplatit toutes les factions et sous-factions
    const allFactions = [
      ...factions,
      ...factions.flatMap(f => f.subfactions || [])
    ];

    // Adapter la fonction de mapping
    const getFactionsByList = (list: string[]): Faction[] =>
      (list
        .map((id: string) => allFactions.find((f: Faction) => f.id.toLowerCase() === id.toLowerCase()))
        .filter(Boolean) as Faction[])
        .filter((f: Faction) =>
          translate(f.name, f.id).toLowerCase().includes(search.toLowerCase())
        );

    const imperiumFactions = getFactionsByList(imperiumList);
    const chaosFactions = getFactionsByList(chaosList);
    const xenosFactions = getFactionsByList(xenosList);

    const renderGroup = (title: string, groupFactions: Faction[]) => (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold', pl: 1 }}>{title}</Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}>
          {groupFactions.map((faction: Faction) => (
            <Card
              key={faction.id}
              onClick={() => handleFactionClick(faction.id)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedFaction?.id === faction.id 
                  ? 'rgba(255, 215, 0, 0.15)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                border: '3px solid',
                borderColor: selectedFaction?.id === faction.id 
                  ? 'primary.main'
                  : theme.palette.divider,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                },
                aspectRatio:  isMobile ? '21/9' : '16/9',
                width: '100%',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                minHeight: { xs: 130, sm: 130, md: 130 },
                display: 'block',
                overflow: 'hidden',
              }}
            >
              {/* Image de fond + dégradé */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.82), rgba(0,0,0,0.0)), url(${getFactionImage(faction.id)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.95,
                }}
              />
              {/* Nom et icône en haut à gauche */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.2,
                zIndex: 2,
                borderTopLeftRadius: 8,
                borderBottomRightRadius: 12,
                minHeight: 36
              }}>
                <Box 
                  component="img" 
                  src={`https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${faction.id}.svg`} 
                  alt={translate(faction.name, faction.id)}
                  sx={{ 
                    width: 24, 
                    height: 24,
                    objectFit: 'contain',
                    filter: 'invert(1)',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/factions/default.png';
                  }}
                />
                <Typography
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '0 1px 6px rgba(0,0,0,0.7)'
                  }}
                >
                  {translate(faction.name, faction.id)}
                </Typography>
              </Box>
              {/* Bouton info */}
              <Tooltip title="Voir les règles de la faction">
                <IconButton
                  size="medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFaction(faction);
                    setArmyRulesOpen(true);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'primary.main',
                    zIndex: 2
                  }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Card>
          ))}
        </Box>
      </Box>
    );

    return (
      <Box sx={{  flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Champ de recherche en haut */}
        <TextField
          fullWidth
          size="small"
          label="Rechercher une faction"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 1 }}
          variant="outlined"
          InputProps={{
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {/* Liste scrollable au centre */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
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
          {renderGroup('Impérium', imperiumFactions)}
          {renderGroup('Chaos', chaosFactions)}
          {renderGroup('Xénos', xenosFactions)}
        </Box>
        {/* Formulaire de création de liste ancré en bas */}
        <Box sx={{
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'transparent',
        }}>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderListNameField()}
              <ActionButton
                text="Créer la liste"
                disabled={!listName || !selectedFaction}
                borderColor={theme.palette.primary.main}
                onClick={handleCreate}
                filled
                centerText
              />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '9fr 3fr', gap: 2 }}>
              {renderListNameField()}
              <ActionButton
                text="Créer la liste"
                disabled={!listName || !selectedFaction}
                borderColor={theme.palette.primary.main}
                onClick={handleCreate}
                filled
                centerText
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Champ nom de la liste réutilisable
  const renderListNameField = () => (
    <TextField
      fullWidth
      size="small"
      label="Nom de la liste"
      value={listName}
      onChange={(e) => setListName(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          color: theme.palette.mode === 'dark' ? 'white' : 'black',
          '& fieldset': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover fieldset': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          }
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        }
      }}
    />
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={isMobile ? false : 'md'}
        fullWidth
        fullScreen={isMobile}
        disablePortal
        keepMounted={false}
        disableEnforceFocus
        disableAutoFocus
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            backgroundImage: 'none',
            height: isMobile ? '100vh' : '80vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2,
            border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            backdropFilter: 'blur(20px)',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'transparent',
          backdropFilter: 'blur(10px)',
          mb: 3,
          mt: isMobile ? '56px' : 0
        }}>
          {isMobile ? (
            <IconButton onClick={onClose} sx={{ color: 'text.primary', mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          <Typography variant="h5" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Créer une nouvelle liste
          </Typography>
          {!isMobile && (
            <IconButton
              edge="end" 
              onClick={onClose} 
              aria-label="close"
              sx={{ color: 'text.primary', ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3,
          pt: 0,
          flex: '1 1 auto',
          overflow: 'hidden',
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minWidth: isMobile ? undefined : 400
        }}>
          {renderFactionSelection()}
        </DialogContent>
      </Dialog>

      <FactionRules 
        open={armyRulesOpen}
        onClose={() => setArmyRulesOpen(false)}
        factionId={selectedFaction?.id || ''}
        factionName={selectedFaction?.name || ''}
        iconUrl={selectedFaction?.iconUrl}
      />
    </>
  );
};

export default FactionSelector; 