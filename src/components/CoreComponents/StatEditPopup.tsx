import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';
import SacredGeometryBackground from './SacredGeometryBackground';

interface StatEditPopupProps {
  open: boolean;
  onClose: () => void;
  label: string;
  initialValue: string;
  originalValue: string;
  authorizedDVal?: boolean;
  onValidate: (value: string) => void;
  name: string;
}

const WheelField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  allowedValues?: number[];
}> = ({ value, onChange, min = 1, max = 20, allowedValues }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentValue, setCurrentValue] = useState(parseInt(value) || min);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setCurrentValue(parseInt(value) || min);
  }, [value, min]);

  const getNextValue = (current: number, direction: number) => {
    if (allowedValues) {
      const currentIndex = allowedValues.indexOf(current);
      if (currentIndex === -1) return allowedValues[0];
      const nextIndex = (currentIndex + direction + allowedValues.length) % allowedValues.length;
      return allowedValues[nextIndex];
    }
    return Math.min(Math.max(current + direction, min), max);
  };

  const getPreviousValue = (current: number) => {
    if (allowedValues) {
      const currentIndex = allowedValues.indexOf(current);
      if (currentIndex === -1) return allowedValues[0];
      const prevIndex = (currentIndex - 1 + allowedValues.length) % allowedValues.length;
      return allowedValues[prevIndex];
    }
    return Math.max(current - 1, min);
  };

  const getNextValuePreview = (current: number) => {
    if (allowedValues) {
      const currentIndex = allowedValues.indexOf(current);
      if (currentIndex === -1) return allowedValues[0];
      const nextIndex = (currentIndex + 1) % allowedValues.length;
      return allowedValues[nextIndex];
    }
    return Math.min(current + 1, max);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const newValue = getNextValue(currentValue, direction);
    setCurrentValue(newValue);
    onChange(String(newValue));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = startY - e.touches[0].clientY;
    const direction = Math.sign(deltaY);
    if (Math.abs(deltaY) >= 10) {
      const newValue = getNextValue(currentValue, direction);
      setCurrentValue(newValue);
      onChange(String(newValue));
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <Box
      sx={{
        width: '80px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: '18px',
          background: isDark ?
            'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%,  rgba(66, 66, 66, 0.6)  40%,rgba(66, 66, 66, 0.6)  60%, rgba(0, 0, 0, 0.6) 100%)' :
            'linear-gradient(180deg, rgba(194, 194, 194, 0.2) 0%,  rgba(255, 255, 255, 0.6)  40%,rgba(255, 255, 255, 0.6)  60%, rgba(194, 194, 194, 0.2) 100%)',
          width: '44px',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'background 0.2s',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            borderRadius: '8%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.1s ease-out',
            transform: `translateY(${isDragging ? '0' : '0'}px)`,
            overflow: 'hidden',
          }}
        >
          {/* Séparateur supérieur */}
          <Box
            sx={{
              position: 'absolute',
              top: '24px',
              left: '10%',
              right: '10%',
              height: '1px',
              background: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              zIndex: 2,
            }}
          />

          {/* Valeur précédente */}
          <Typography
            sx={(theme) => ({
              color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontWeight: 600,
              textAlign: 'center',
              fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
              position: 'absolute',
              top: '-5px',
              width: '100%',
              zIndex: 1,
            })}
          >
            {getNextValuePreview(currentValue)}
          </Typography>

          {/* Valeur actuelle */}
          <Typography
            sx={(theme) => ({
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '1.2rem',
              fontWeight: 600,
              textAlign: 'center',
              fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
              zIndex: 1,
            })}
          >
            {currentValue}
          </Typography>

          {/* Valeur suivante */}
          <Typography
            sx={(theme) => ({
              color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontWeight: 600,
              textAlign: 'center',
              fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
              position: 'absolute',
              bottom: '-5px',
              width: '100%',
              zIndex: 1,
            })}
          >
            {getPreviousValue(currentValue)}
          </Typography>

          {/* Séparateur inférieur */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '24px',
              left: '10%',
              right: '10%',
              height: '1px',
              background: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              zIndex: 2,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const StatEditPopup: React.FC<StatEditPopupProps> = ({
  open,
  onClose,
  label,
  initialValue,
  originalValue,
  authorizedDVal = true,
  onValidate,
  name
}) => {
  const [tempValue, setTempValue] = useState(initialValue);
  const [showDice, setShowDice] = useState(false);
  const [dice1, setDice1] = useState('1');
  const [dice2, setDice2] = useState('3');
  const [operator, setOperator] = useState<'+' | '-' | null>('+');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setTempValue(initialValue);
    
    if (initialValue.includes('D')) {
      setShowDice(true);
      
      const parts = initialValue.split('D');
      const beforeD = parts[0];
      const afterD = parts[1];
      
      if (beforeD && beforeD !== '') {
        setDice1(beforeD);
      } else {
        setDice1('1');
      }
      
      if (afterD) {
        const operatorMatch = afterD.match(/^(\d+)([+-])(\d+)$/);
        if (operatorMatch) {
          setDice2(operatorMatch[1]);
          setOperator(operatorMatch[2] as '+' | '-');
          setTempValue(operatorMatch[3]);
        } else {
          setDice2(afterD);
          setTempValue('0');
        }
      }
    }
  }, [initialValue]);

  const handleValidate = () => {
    if (showDice) {
      onValidate(getFormula());
    } else {
      onValidate(tempValue);
    }
    onClose();
  };

  const handleReset = () => {
    setTempValue(originalValue);
    setShowDice(false);
  };

  const getFormula = () => {
    if (!showDice) return tempValue;
    
    const dice1Value = dice1 === '1' ? '' : dice1;
    const dice3Part = tempValue === '0' ? '' : `${operator}${tempValue}`;
    
    return `${dice1Value}D${dice2}${dice3Part}`;
  };

  const toggleOperator = () => {
    setOperator(operator === '+' ? '-' : '+');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          }
        }
      }}
      keepMounted
    >
      <Box
        sx={{
          backgroundColor: 'transparent',
          borderRadius: '50%',
          aspectRatio: '1 / 1',
          width: 'min(117vw, 117vh, 420px)',
          height: 'auto',
          maxWidth: '98vw',
          maxHeight: '98vh',
          zIndex: 9999,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          mx: 'auto',
          my: 'auto',
          boxShadow: 8,
          border: '1px solid',
          borderColor: 'primary.main',
          background: 'radial-gradient(circle, rgba(20,30,40,0.92) 0%, rgba(20,30,40,0.7) 60%, rgba(20,30,40,0.1) 90%, rgba(20,30,40,0) 100%)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Arrière-plan géométrie sacrée sur toute la surface */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}>
          <SacredGeometryBackground style={{ width: '100%', height: '100%', transform: 'scale(1)' }} />
        </Box>
        {/* Contenu du popup */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: 'min(90vw, 90vh, 420px)',
            aspectRatio: '1 / 1',
            height: '100%',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'visible',
            textAlign: 'center',
          }}>
          {/* Zone supérieure - Nom, Label et Valeur calculée  */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            width: '100%' 
          }}>
          
            <Box sx={{
              mt: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1.5,
              py: 0.5,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              background: isDark ? 
                'linear-gradient(45deg, rgba(66, 66, 66, 0.6) 0%,rgba(0, 0, 0, 0.6) 100%)' : 
                'linear-gradient(45deg, rgba(255, 255, 255, 0.8)  0%, rgba(194, 194, 194, 0.4) 100%)',
              minWidth: 64,
              minHeight: 40,
              alignSelf: 'center',
            }}>
              <Typography sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontSize: '0.75rem',
                fontWeight: 500,
                mb: 0.2,
                lineHeight: 1,
                letterSpacing: '0.03em',
              }}>
                {label}
              </Typography>
              <Typography sx={{
                color: isDark ? 'primary.main' : 'primary.dark',
                fontSize: '1.2rem',
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'center',
              }}>
                {label === 'Pénétration d\'armure' && getFormula() !== '0' ? '-' + getFormula() : getFormula()}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%'}}>
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' , mt: 'auto',
                mb: 0,}}>
                {name}
              </Typography>
            </Box>
          </Box>
          {/* Zone centrale - Dés et boutons de contrôle */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Box sx={{ 
              width: '100%',
              minWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 1,
                width: '100%',
                justifyContent: 'center'
              }}>
                {/* Bouton dé à gauche */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 }}>
                  {authorizedDVal ? (
                    <IconButton
                      onClick={() => setShowDice(!showDice)}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        width: '36px',
                        height: '36px'
                      }}
                    >
                      <CasinoIcon />
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 36, height: 36 }} />
                  )}
                </Box>
                {/* Zone centrale à largeur fixe */}
                <Box sx={{ width: 240, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {showDice ? (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <KeyboardArrowUpIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                        <WheelField value={dice1} onChange={setDice1} min={1} max={30} />
                        <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                      </Box>
                      <Typography sx={(theme) => ({ color:  'white', fontSize: '1.4rem', fontWeight: 400 })}>D</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5}}>
                        <KeyboardArrowUpIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                        <WheelField value={dice2} onChange={setDice2} allowedValues={[3, 6]} />
                        <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                      </Box>
                      <Box
                        onClick={toggleOperator}
                        sx={{
                          border: '1px solid',
                          borderColor: 'primary.main',
                          color: 'rgba(255, 255, 255, 0.8)',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s ease',
                          background: isDark ? 
                            'linear-gradient(45deg, rgba(66, 66, 66, 0.6) 0%,rgba(0, 0, 0, 0.6) 100%)' : 
                            'linear-gradient(45deg, rgba(255, 255, 255, 0.6)  0%, rgba(194, 194, 194, 0.2) 100%)',
                          flexShrink: 0,
                          alignSelf: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                          {operator}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <KeyboardArrowUpIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                        <WheelField value={tempValue} onChange={setTempValue} min={0} max={20} />
                        <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: '1.5rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 0.5,
                      width: '100%',
                      justifyContent: 'center'
                    }}>
                      <KeyboardArrowUpIcon sx={{ color: 'primary.main', fontSize: '1.2rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                      <WheelField value={tempValue} onChange={setTempValue} min={0} max={20} />
                      <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: '1.2rem', opacity: 0.7, animation: 'bounce 2s infinite' }} />
                    </Box>
                  )}
                </Box>
                {/* Bouton réinit à droite */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 }}>
                  <IconButton
                    onClick={handleReset}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      width: '36px',
                      height: '36px'
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* Zone inférieure - Boutons de validation */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Box sx={{ 
              width: '100%',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 2,
            }}>
              <IconButton
                onClick={onClose}
                sx={{
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  background: isDark
                    ? 'linear-gradient(45deg, rgba(66, 66, 66, 0.6) 0%,rgba(0, 0, 0, 0.6) 100%)'
                    : 'linear-gradient(45deg, rgba(255, 255, 255, 0.6)  0%, rgba(194, 194, 194, 0.2) 100%)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px'
                }}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={handleValidate}
                sx={{
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  background: isDark
                    ? 'linear-gradient(45deg, rgba(66, 66, 66, 0.6) 0%,rgba(0, 0, 0, 0.6) 100%)'
                    : 'linear-gradient(45deg, rgba(255, 255, 255, 0.4)  0%, rgba(194, 194, 194, 0.2) 100%)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px'
                }}
              >
                <CheckIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default StatEditPopup; 