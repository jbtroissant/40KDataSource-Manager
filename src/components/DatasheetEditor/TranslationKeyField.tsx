import React from 'react';
import { TextField, IconButton, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface TranslationKeyFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearchClick?: () => void;
  translationsFr?: Record<string, string>;
  translationsEn?: Record<string, string>;
  snakeCase?: boolean;
  margin?: 'none' | 'dense' | 'normal';
  fullWidth?: boolean;
  disabled?: boolean;
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

const TranslationKeyField: React.FC<TranslationKeyFieldProps> = ({
  label,
  value,
  onChange,
  onSearchClick,
  translationsFr = {},
  translationsEn = {},
  snakeCase = true,
  margin = 'normal',
  fullWidth = true,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={handleChange}
        margin={margin}
        fullWidth={fullWidth}
        disabled={disabled}
        InputProps={onSearchClick ? {
          endAdornment: (
            <IconButton onClick={onSearchClick} size="small" color="primary">
              <SearchIcon />
            </IconButton>
          )
        } : undefined}
      />
      {value && (
        <>
          {translationsFr[value] && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, maxWidth: '100%' }}>
              fr: {translationsFr[value].length > 300 ? translationsFr[value].slice(0, 300) + '...' : translationsFr[value]}
            </Typography>
          )}
          {translationsEn[value] && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, maxWidth: '100%' }}>
              en: {translationsEn[value].length > 300 ? translationsEn[value].slice(0, 300) + '...' : translationsEn[value]}
            </Typography>
          )}
        </>
      )}
    </>
  );
};

export default TranslationKeyField; 