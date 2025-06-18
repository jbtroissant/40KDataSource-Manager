import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemButton, ListItemText, Typography, Grid, Box } from '@mui/material';

interface TranslationSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
  translationsFr: Record<string, string>;
  translationsEn: Record<string, string>;
  factionId: string;
}

const TranslationSearchDialog: React.FC<TranslationSearchDialogProps> = ({ open, onClose, onSelect, translationsFr, translationsEn, factionId }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    // Log pour debug
    console.log('Clés FR:', Object.keys(translationsFr));
    console.log('Clés EN:', Object.keys(translationsEn));
    // Recherche dans les fichiers flat de la faction
    const fr = translationsFr || {};
    const en = translationsEn || {};
    const keys = Object.keys(fr);
    if (keys.length === 0) {
      setError('Aucune clé trouvée dans le fichier de traduction plat pour cette faction.');
      setResults([]);
      return;
    }
    const filtered = keys.filter(key =>
      key.toLowerCase().includes(search.toLowerCase()) ||
      (fr[key] && fr[key].toLowerCase().includes(search.toLowerCase())) ||
      (en[key] && en[key].toLowerCase().includes(search.toLowerCase()))
    );
    if (filtered.length === 0) {
      setError('Aucun résultat trouvé pour cette recherche.');
    } else {
      setError(null);
    }
    setResults(filtered);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Recherche de traduction</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 2 }}>
          <TextField
            fullWidth
            label="Rechercher une clé, un texte FR ou EN"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 120, height: '100%' }}>Rechercher</Button>
        </Box>
        {error && (
          <ListItem>
            <ListItemText primary={error} />
          </ListItem>
        )}
        <List>
          {results.map(key => (
            <ListItem key={key} disablePadding>
              <ListItemButton onClick={() => { onSelect(key); onClose(); }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">EN : {translationsEn[key]}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="primary">{key}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <Typography variant="body2">FR : {translationsFr[key]}</Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
          {results.length === 0 && (
            <ListItem>
              <ListItemText primary="Aucun résultat" />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranslationSearchDialog; 