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
  Box
} from '@mui/material';

interface CleanupDialogProps {
  open: boolean;
  onClose: () => void;
  keysToRemove: string[];
  onConfirm: () => void;
}

const CleanupDialog: React.FC<CleanupDialogProps> = ({
  open,
  onClose,
  keysToRemove,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nettoyage des données</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Les clés suivantes seront supprimées car elles n'existent pas dans le fichier traduit :
        </Typography>
        <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
          <List>
            {keysToRemove.map((key) => (
              <ListItem key={key}>
                <ListItemText primary={key} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirmer le nettoyage
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CleanupDialog; 