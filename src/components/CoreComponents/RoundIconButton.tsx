import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';

interface RoundIconButtonProps {
  icon: React.ReactNode;
  color: string;
  tooltip: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: number;
}

const RoundIconButton: React.FC<RoundIconButtonProps> = ({ icon, color, tooltip, onClick, size = 36 }) => {
  const theme = useTheme();
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        sx={{
          color: color,
          bgcolor: color,
          backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid',
          borderColor: color,
          '&:hover': { bgcolor: color },
          borderRadius: '50%',
          width: size,
          height: size,
          ml: 1,
          boxShadow: 4,
        }}
        size="small"
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default RoundIconButton; 