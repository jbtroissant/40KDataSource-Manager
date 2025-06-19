import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CleanupDialogProps {
  open: boolean;
  onClose: () => void;
  keysToRemove: string[];
  translationData?: Record<string, string>;
  keyReplacements?: Record<string, string>;
  keyUsageLocations?: Record<string, string[]>;
  standardKeywordsToRemove?: string[];
  onConfirm: () => void;
}

const CleanupDialog: React.FC<CleanupDialogProps> = ({
  open,
  onClose,
  keysToRemove,
  translationData = {},
  keyReplacements = {},
  keyUsageLocations = {},
  standardKeywordsToRemove = [],
  onConfirm
}) => {
  // Séparer les mots-clés standards des autres clés
  const standardKeywords = [
    'Fly', 'Vehicle', 'Mounted', 'Grenades', 'Infantry', 'Character', 'Epic Hero', 
    'Psyker', 'Psychic', 'Precision', 'Lethal Hits', 'Aircraft', 'Twin-linked', 
    'Hover', 'Monster', 'Primarch', 'Walker', 'Battleline', 'Smoke', 'Titan', 
    'Titanic', 'Transport', 'Leader', 'Lone Operative', 'Stealth', 'Deadly Demise', 
    'Feel No Pain', 'Fights First', 'Deep Strike', 'Scouts', 'Firing Deck', 'Pistol',
    'Hazardous', 'Blast', 'Torrent', 'Ignores Cover', 'Heavy', 'Extra Attacks', 
    'Assault', 'Devastating Wounds', 'One Shot'
  ];

  const standardKeysToRemove = keysToRemove.filter(key => 
    standardKeywords.includes(key) || 
    standardKeywords.some(keyword => key.startsWith(keyword) && key !== keyword)
  );
  const otherKeysToRemove = keysToRemove.filter(key => !standardKeysToRemove.includes(key));

  const renderKeyItem = (key: string, isStandardKeyword: boolean = false) => (
    <ListItem key={key} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography variant="h6" color="error" sx={{ fontFamily: 'monospace', mb: 1 }}>
          Clé à supprimer: {key}
        </Typography>
        
        {isStandardKeyword && (
          <Box sx={{ mb: 1 }}>
            <Chip 
              label="Supprimé seulement des fichiers flat" 
              size="small" 
              color="info" 
              variant="outlined"
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}
        
        {translationData[key] && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Traduction:
            </Typography>
            <Chip 
              label={translationData[key]} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}

        {keyReplacements[key] && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Remplacée par:
            </Typography>
            <Chip 
              label={keyReplacements[key]} 
              size="small" 
              color="success" 
              variant="outlined"
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}

        {keyUsageLocations[key] && keyUsageLocations[key].length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Utilisée dans le fichier traduit aux endroits suivants:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {keyUsageLocations[key].map((location, index) => (
                <Chip 
                  key={index}
                  label={location} 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {keyUsageLocations[key] && keyUsageLocations[key].length === 0 && !isStandardKeyword && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              ⚠️ Cette clé n'est pas utilisée dans le fichier traduit
            </Typography>
          </Box>
        )}
      </Box>
    </ListItem>
  );

  const totalKeysToRemove = keysToRemove.length + standardKeywordsToRemove.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Nettoyage des données</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Les clés suivantes seront supprimées car elles n'existent pas dans le fichier traduit, sont en double, ou sont des mots-clés standards :
        </Typography>
        <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
          <List>
            {/* Section des mots-clés standards */}
            {standardKeywordsToRemove.length > 0 && (
              <>
                <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 1, px: 2 }}>
                  🔧 Mots-clés standards à supprimer des fichiers flat ({standardKeywordsToRemove.length})
                </Typography>
                {standardKeywordsToRemove.map((key, index) => renderKeyItem(key, true))}
              </>
            )}

            {/* Section des autres clés */}
            {otherKeysToRemove.length > 0 && (
              <>
                <Typography variant="h6" color="secondary" sx={{ mt: 2, mb: 1, px: 2 }}>
                  📝 Autres clés à supprimer ({otherKeysToRemove.length})
                </Typography>
                {otherKeysToRemove.map((key, index) => renderKeyItem(key, false))}
              </>
            )}

            {totalKeysToRemove === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Aucune clé à supprimer trouvée.
              </Typography>
            )}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirmer le nettoyage ({totalKeysToRemove} clés)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CleanupDialog; 