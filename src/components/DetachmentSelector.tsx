import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Card,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import DetachmentDetails from './DetachmentDetails';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslate } from '../services/translationService';
import { useDatasource } from '../contexts/DatasourceContext';

interface Detachment {
  name: string;
  enhancements: any[];
  rules: any[];
  stratagems: any[];
}

interface DetachmentSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (detachment: any) => void;
  factionId: string;
  factionName: string;
  currentDetachment?: string;
}

const DetachmentSelector: React.FC<DetachmentSelectorProps> = ({ 
  open, 
  onClose, 
  onSelect, 
  factionId,
  factionName,
  currentDetachment
}) => {
  const [selectedDetachment, setSelectedDetachment] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetachmentDetails, setSelectedDetachmentDetails] = useState<any>(null);
  const [availableDetachments, setAvailableDetachments] = useState<Detachment[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { lang } = useLanguage();
  const translate = useTranslate();
  const { datasource } = useDatasource();

  React.useEffect(() => {
    if (!open || !datasource) return;

    let allDetachments: Detachment[] = [];
    const factionData = Object.values(datasource).find(
      (f: any) => f && f.id && f.id.toLowerCase() === (factionId || '').toLowerCase()
    ) as any;
    if (factionData?.detachments) {
      allDetachments.push(...factionData.detachments);
    }
    setAvailableDetachments(allDetachments);
  }, [open, factionId, lang, datasource]);

  const handleInfoClick = (e: React.MouseEvent, det: Detachment) => {
    e.stopPropagation();
    setSelectedDetachmentDetails(det);
    setDetailsOpen(true);
  };

  const handleDetachmentSelect = async (detachment: Detachment) => {
    const translatedName = translate(detachment.name, factionId);
    setSelectedDetachment(translatedName);
    onSelect(detachment);
    onClose();
  };

  if (isMobile && open) {
    if (detailsOpen && selectedDetachmentDetails) {
      return (
        <DetachmentDetails
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          detachment={selectedDetachmentDetails}
          faction={{ id: factionId, name: factionName, iconUrl: `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg` }}
        />
      );
    }
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '56px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 56px)',
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
        }}
      >
        {/* En-tête mobile */}
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
            Sélectionner un détachement
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
          <Box sx={{
            p: 1,
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(4, 1fr)'
            },
            gap: 3,
            alignContent: 'start',
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
            {availableDetachments.map((det) => {
              return (
              <Card 
                  key={det.name}
                  onClick={() => handleDetachmentSelect(det)}
                sx={{
                  cursor: 'pointer',
                    bgcolor:  theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid',
                    borderColor: currentDetachment === det.name
                    ? 'primary.main'
                    : theme.palette.divider,
                  borderRadius: 2,
                  width: '100%',
                  height: '100%',
                  aspectRatio: '1/1',
                  position: 'relative',
                  px: 2,
                  py: 2,
                  backdropFilter: 'blur(10px)',
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundSize: 'contain',
                    backgroundOrigin: 'content-box',
                    padding: '3%',
                    backgroundImage: `url(https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg)`,
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.10,
                    zIndex: 0,
                  },
                }}
              >
                <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  {translate(det.name, factionId)}
                </Typography>
                  <Tooltip title={translate('more_info', factionId)}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleInfoClick(e, det)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: 'primary.main',
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  // Desktop : Dialog
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={isMobile ? false : 'md'}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            backgroundImage: 'none',
            height: isMobile ? '100vh' : '80vh',
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
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'transparent',
          backdropFilter: 'blur(10px)',
          mb: 3,
          minHeight: 56,
          maxHeight: isMobile ? 64 : '',
        }}>
          {isMobile ? (
            <IconButton onClick={onClose} sx={{ color: 'text.primary', mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Sélectionnez un détachement
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
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            bgcolor: 'transparent'
          }}>
            <Box sx={{ 
              p: 1, 
              flex: 1, 
              overflow: 'auto', 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(4, 1fr)'
              },
              gap: 3,
              alignContent: 'start',
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
            {availableDetachments.map((det) => {
              return (
                <Card 
                  key={det.name}
                  onClick={() => handleDetachmentSelect(det)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.3)',
                    border: '2px solid',
                    borderColor: currentDetachment === det.name
                      ? 'primary.main'
                      : theme.palette.divider,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      borderColor: theme.palette.getContrastText(theme.palette.primary.main),
                      color: theme.palette.getContrastText(theme.palette.primary.main),
                    },
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1/1',
                    position: 'relative',
                    px: 2,
                    py: 2,
                    backdropFilter: 'blur(10px)',
                    minHeight: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundSize: 'contain',
                      backgroundOrigin: 'content-box',
                      padding: '12%',
                      backgroundImage: `url(https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg)`,
                      filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      opacity: 0.10,
                      zIndex: 0,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{mb: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {translate(det.name, factionId)}
                  </Typography>
                  <Tooltip title={translate('more_info', factionId)}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleInfoClick(e, det)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'primary.main',
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Card>
              );
            })}
            </Box>
          </DialogContent>
      </Dialog>

      {selectedDetachmentDetails && (
        <DetachmentDetails
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          detachment={selectedDetachmentDetails}
          faction={{ 
            id: factionId, 
            name: factionName,
            iconUrl: `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`
          }}
        />
      )}
    </>
  );
};

export default DetachmentSelector; 