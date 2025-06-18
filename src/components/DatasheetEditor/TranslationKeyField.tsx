import React, { useState, useRef, useEffect } from 'react';
import { TextField, Typography, Popper, Paper, List, ListItem, ListItemText, Box } from '@mui/material';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const anchorEl = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!newValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }
    const filtered = Object.keys(translationsFr).filter(key =>
      key.toLowerCase().includes(newValue.toLowerCase()) ||
      (translationsFr[key] && translationsFr[key].toLowerCase().includes(newValue.toLowerCase())) ||
      (translationsEn[key] && translationsEn[key].toLowerCase().includes(newValue.toLowerCase()))
    );
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onChange(suggestions[selectedIndex]);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter' && onSearchClick) {
      e.preventDefault();
      onSearchClick();
    }
  };

  useEffect(() => {
    if (!showSuggestions) {
      setSelectedIndex(-1);
    }
  }, [showSuggestions]);

  return (
    <div ref={anchorEl}>
      <TextField
        label={label}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        margin={margin}
        fullWidth={fullWidth}
        disabled={disabled}
      />
      <Popper
        open={showSuggestions && suggestions.length > 0}
        anchorEl={anchorEl.current}
        placement="bottom-start"
        style={{ width: anchorEl.current?.offsetWidth }}
      >
        <Paper elevation={3}>
          <List>
            {suggestions.map((key, index) => (
              <ListItem
                key={key}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? 'action.selected' : 'inherit'
                }}
                onClick={() => {
                  onChange(key);
                  setShowSuggestions(false);
                }}
              >
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
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>
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
    </div>
  );
};

export default TranslationKeyField; 