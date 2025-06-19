import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,  
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Fab,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  PlayArrow as PlayArrowIcon,
  DriveFileRenameOutline as RenameIcon,
  Build as BuildIcon,
  Undo as UndoIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Army } from '../types/army';
import AppLayout from './AppLayout';
import { calculateTotalPoints } from '../utils/pointsCalculator';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslate } from '../services/translationService';
import ActionButton from './CoreComponents/ActionButton';
import RoundIconButton from './CoreComponents/RoundIconButton';
import { loadDatasource } from '../utils/datasourceDb';
import FactionRules from './FactionRules';

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

const factionImages: { [key: string]: string } = {
  'AS': '/images/factions/AS.png',
  'AC': '/images/factions/AC.png',
  'AdM': '/images/factions/AdM.png',
  'AE': '/images/factions/AE.png',
  'AM': '/images/factions/AM.png',
  'CHBT': '/images/factions/CHBT.png',
  'CHBA': '/images/factions/CHBA.png',
  'CD': '/images/factions/CD.png',
  'QT': '/images/factions/QT.png',
  'CSM': '/images/factions/CSM.png',
  'CHDA': '/images/factions/CHDA.png',
  'DG': '/images/factions/DG.png',
  'DW': '/images/factions/DW.png',
  'DRU': '/images/factions/DRU.png',
  'LGEC': '/images/factions/LGEC.png',
  'GSC': '/images/factions/GSC.png',
  'GK': '/images/factions/GK.png',
  'HQ': '/images/factions/HQ.png',
  'AoI': '/images/factions/AoI.png',
  'IF': '/images/factions/IF.png',
  'QI': '/images/factions/QI.png',
  'IH': '/images/factions/IH.png',
  'LoV': '/images/factions/LoV.png',
  'NEC': '/images/factions/NEC.png',
  'ORK': '/images/factions/ORK.png',
  'RG': '/images/factions/RG.png',
  'SAM': '/images/factions/SAM.png',
  'SM': '/images/factions/SM.png',
  'CHSW': '/images/factions/CHSW.png',
  'TAU': '/images/factions/TAU.png',
  'TS': '/images/factions/TS.png',
  'TYR': '/images/factions/TYR.png',
  'UM': '/images/factions/UM.png',
  'WS': '/images/factions/WS.png',
  'WE': '/images/factions/WE.png',
  'YI': '/images/factions/YI.png',
  'CHDW': '/images/factions/CHDW.png'
};

const HomePage: React.FC = () => {
  const [armies, setArmies] = useState<Army[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedArmy, setSelectedArmy] = useState<Army | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [flippedArmyId, setFlippedArmyId] = useState<string | null>(null);
  const [showCombinedUnitsDialog, setShowCombinedUnitsDialog] = useState(false);
  const [selectedArmyForEdit, setSelectedArmyForEdit] = useState<Army | null>(null);
  const [armyRulesOpen, setArmyRulesOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const translate = useTranslate();

  useEffect(() => {
    const loadArmies = () => {
      const armiesData = JSON.parse(localStorage.getItem('army_list') || '[]');
      // Calculer les points pour chaque armée
      const armiesWithPoints = armiesData.map((army: Army) => {
        const totalPoints = calculateTotalPoints(army.units || []);
        return {
          ...army,
          points: totalPoints
        };
      });
      // Tri décroissant par date de modification
      armiesWithPoints.sort((a: Army, b: Army) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setArmies(armiesWithPoints);
    };

    const loadFactions = async () => {
      const datasourceStr = await loadDatasource();
      if (datasourceStr) {
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
      }
    };

    loadArmies();
    loadFactions();
  }, []);

  const handleCreateClick = () => {
    // Rediriger directement vers ArmyBuilder avec l'ID de la faction
    navigate('/army-builder/new');
  };

  const handleDeleteClick = (army: Army) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedArmy(army);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedArmy(null);
  };

  const handleConfirmDelete = () => {
    if (selectedArmy) {
      const updatedArmies = armies.filter(a => a.armyId !== selectedArmy.armyId);
      setArmies(updatedArmies);
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
    }
    handleCloseDeleteDialog();
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedArmy(null);
    setEditName('');
  };

  const handleSaveEdit = () => {
    if (selectedArmy) {
      const updatedArmies = armies.map(a => 
        a.armyId === selectedArmy.armyId 
          ? { ...a, name: editName }
          : a
      );
      setArmies(updatedArmies);
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
    }
    handleCloseEditDialog();
  };

  const handleArmyClick = (armyId: string) => {
    navigate(`/army/${armyId}`);
  };

  // Fonction pour vérifier la présence d'unités combinées ou perdues
  const checkForCombinedUnits = (units: any[]) => {
    return units.some(unit => 'isCombinedUnit' in unit || unit.isLost);
  };

  const handleEditArmyClick = (army: Army) => (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (checkForCombinedUnits(army.units || [])) {
      setSelectedArmyForEdit(army);
      setShowCombinedUnitsDialog(true);
    } else {
      navigate(`/army-builder/${army.armyId}`);
    }
  };

  const handleContinueToBuilder = () => {
    if (selectedArmyForEdit) {
      // Récupérer les IDs des unités combinées
      const combinedUnitIds = (selectedArmyForEdit.units || [])
        .filter(unit => 'isCombinedUnit' in unit)
        .map(unit => unit.id);

      // Mettre à jour les unités liées pour supprimer leur statut de liaison et réinitialiser isLost
      const updatedUnits = (selectedArmyForEdit.units || []).map(unit => {
        if (unit.isLinked && unit.linkedTo && combinedUnitIds.includes(unit.linkedTo)) {
          // Supprimer les propriétés de liaison et isLost
          const { isLinked, linkedTo, isLost, ...rest } = unit;
          return rest;
        }
        // Réinitialiser isLost pour toutes les unités
        const { isLost, ...rest } = unit;
        return rest;
      }).filter(unit => !('isCombinedUnit' in unit)); // Supprimer les unités combinées
      
      // Mettre à jour le localStorage
      const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const updatedArmies = armies.map((a: Army) => {
        if (a.armyId === selectedArmyForEdit.armyId) {
          return {
            ...a,
            units: updatedUnits,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      // Naviguer vers le builder
      navigate(`/army-builder/${selectedArmyForEdit.armyId}`);
    }
    setShowCombinedUnitsDialog(false);
    setSelectedArmyForEdit(null);
  };

  const handleCancelEdit = () => {
    setShowCombinedUnitsDialog(false);
    setSelectedArmyForEdit(null);
  };

  const handleCardClick = (army: Army) => {
    setFlippedArmyId(army.armyId);
  };

  const handleFlipBack = () => {
    setFlippedArmyId(null);
  };

  const handleFactionClick = (factionId: string) => {
    navigate(`/faction/${factionId}`);
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

  const getFactionImage = (id: string) => `/images/factions/${id}.png`;

  const renderFactionSection = () => {
    const imperiumList = [
      'AS', 'AC', 'AdM', 'AM', 'CHBT','CHBA', 'CHDA', 'CHDW', 'GK', 'AoI','QI', 'SM', 'CHSW'
    ];
    const chaosList = [
      'CD', 'QT', 'CSM', 'DG', 'LGEC', 'WE', 'TS'
    ];
    const xenosList = [
      'AE', 'DRU', 'GSC', 'HQ', 'LoV', 'NEC','ORK', 'TAU', 'TYR', 'UN'
    ];

    const allFactions = [
      ...factions,
      ...factions.flatMap(f => f.subfactions || [])
    ];

    const getFactionsByList = (list: string[]): Faction[] =>
      list
        .map((id: string) => allFactions.find((f: Faction) => f.id.toLowerCase() === id.toLowerCase()))
        .filter(Boolean) as Faction[];

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
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.3)',
                border: '3px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                },
                aspectRatio: isMobile ? '21/9' : '16/9',
                width: '100%',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                minHeight: { xs: 130, sm: 130, md: 130 },
                display: 'block',
                overflow: 'hidden',
              }}
            >
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
      <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
      </Box>
    );
  };

  return (
    <AppLayout title="Factions disponnibles">
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
        position: 'relative',
        overflow: 'auto',
        zIndex: 0
      }}>
        {renderFactionSection()}
      </Box>

      <FactionRules 
        open={armyRulesOpen}
        onClose={() => setArmyRulesOpen(false)}
        factionId={selectedFaction?.id || ''}
        factionName={selectedFaction?.name || ''}
        iconUrl={selectedFaction?.iconUrl}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'armée "{selectedArmy?.name}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <ActionButton
            text="Annuler"
            borderColor={theme.palette.primary.main}
            onClick={handleCloseDeleteDialog}
            filled
          />
          <ActionButton
            text="Supprimer"
            borderColor={theme.palette.error.main}
            onClick={handleConfirmDelete}
            filled
          />
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
      >
        <DialogTitle>Modifier le nom de l'armée</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'armée"
            type="text"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <ActionButton
            text="Annuler"
            borderColor={theme.palette.primary.main}
            onClick={handleCloseEditDialog}
          />
          <ActionButton
            text="Enregistrer"
            borderColor={theme.palette.primary.main}
            onClick={handleSaveEdit}
            filled
          />
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCombinedUnitsDialog}
        onClose={handleCancelEdit}
        aria-labelledby="combined-units-dialog-title"
      >
        <DialogTitle id="combined-units-dialog-title">
          Attention
        </DialogTitle>
        <DialogContent>
          <Typography>
            Certaines unités de votre liste ont été modifiées dans le mode de jeu. Si vous continuez, la liste sera réinitialisée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <ActionButton
            text="Annuler"
            borderColor={theme.palette.primary.main}
            onClick={handleCancelEdit}
          />
          <ActionButton
            text="Continuer"
            borderColor={theme.palette.primary.main}
            onClick={handleContinueToBuilder}
            filled
          />
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default HomePage; 