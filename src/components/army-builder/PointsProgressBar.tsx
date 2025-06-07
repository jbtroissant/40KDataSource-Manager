import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface PointsProgressBarProps {
  totalPoints: number;
}

const PointsProgressBar: React.FC<PointsProgressBarProps> = ({ totalPoints }) => {

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocalFireDepartmentIcon sx={{ color: 'primary.main', mr: 1, fontSize: 18 }} />
        <Typography variant="body2" color="text.secondary">
          Points:&nbsp;
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {totalPoints}
        </Typography>
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontStyle: 'italic' }}>
          ({totalPoints > 2000 ? 'Offensive' : totalPoints > 1000 ? 'Force de frappe' : 'Incursion'})
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">0</Typography>
          <Box sx={{ position: 'absolute', left: '33.33%', zIndex: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                color: totalPoints > 1000 ? '#ff0000' : totalPoints <= 1000 ? "#008b05" : "text.secondary",
                fontWeight: 'medium',
                whiteSpace: 'nowrap'
              }}
            >
              1000
              {totalPoints < 1000 ? ' (-' + (1000 - totalPoints) +' pts)' : ''}
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', left: '66.66%', zIndex: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                color: totalPoints > 2000 ? '#ff0000' : totalPoints <=  2000 && totalPoints > 1000 ? "#008b05" : "text.secondary",
                fontWeight: 'medium',
                whiteSpace: 'nowrap'
              }}
            >
              2000
              {(totalPoints > 1000 && totalPoints < 2000) ? ' (-' + (2000 - totalPoints) +' pts)' : ''}
            </Typography>
          </Box>
          <Typography variant="caption" 
            color={totalPoints > 3000 ? '#ff0000' : totalPoints <= 3000 && totalPoints > 2000 ? "#008b05" : "text.secondary"}
          >
            3000
            {totalPoints > 2000 && (
              <>
                <br />
                (-{3000 - totalPoints} pts)
              </>
            )}
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={(totalPoints / 3000) * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: totalPoints > 3000 ? '#c31717' : totalPoints > 2000 ? '#9452c9' : totalPoints > 1000 ? '#5294c9' : '#008b16',
                borderRadius: 5,
              }
            }} 
          />
          {/* Séparateurs verticaux */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '33.33%',
            width: '2px',
            height: '10px',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            zIndex: 1
          }} />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '66.66%',
            width: '2px',
            height: '10px',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            zIndex: 1
          }} />
        </Box>
      </Box>
    </Box>
  );
};

export default PointsProgressBar; 