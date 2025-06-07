import React from 'react';
import { Button, useTheme } from '@mui/material';

interface ActionButtonProps {
  icon?: React.ReactNode;
  text: string;
  borderColor: string;
  onClick?: (e: React.MouseEvent) => void;
  filled?: boolean;
  disabled?: boolean;
  centerText?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, borderColor, onClick, filled, disabled, centerText }) => {
  const theme = useTheme();
  return (
    <Button
      variant={filled ? 'contained' : 'outlined'}
      {...(icon ? { startIcon: icon } : {})}
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: filled
          ? borderColor
          : (theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.3)'
              : 'rgba(255, 255, 255, 0.3)'),
        color: filled
          ? theme.palette.getContrastText(borderColor)
          : (theme.palette.mode === 'dark' ? 'white' : 'black'),
        border: '1.5px solid',
        borderColor,
        fontWeight: 500,
        borderRadius: 999,
        boxShadow: 2,
        py: 0.7,
        fontSize: 14,
        backdropFilter: filled ? undefined : 'blur(10px)',
        '&:hover': {
          backgroundColor: borderColor,
          color: theme.palette.getContrastText(borderColor),
          borderColor,
          '& .MuiSvgIcon-root': {
            color: theme.palette.getContrastText(borderColor),
          },
        },
        justifyContent: centerText ? 'center' : 'flex-start',
        textTransform: 'none',
        '& .MuiSvgIcon-root': {
          color: filled ? theme.palette.getContrastText(borderColor) : borderColor,
          transition: 'color 0.2s',
        },
      }}
    >
      {text}
    </Button>
  );
};

export default ActionButton; 