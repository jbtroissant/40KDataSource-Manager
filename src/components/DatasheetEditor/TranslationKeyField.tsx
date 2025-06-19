import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TextField, Typography, Popper, Paper, List, ListItem, ListItemText, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
  language?: 'fr' | 'en';
}

function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedCallback = useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
  return debouncedCallback;
}

// Fonction utilitaire pour transformer en snake_case
function toSnakeCase(str: string) {
  // Remplacement compatible ES5 pour retirer les accents
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^\w\s]/gi, '') // retire la ponctuation
    .trim()
    .replace(/\s+/g, '_')
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
  language = 'fr',
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const anchorEl = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Fonction de filtrage avec limitation à 20 résultats
  const filterSuggestions = useCallback((input: string) => {
    if (!input) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }
    const filtered = Object.keys(translationsFr).filter(key =>
      key.toLowerCase().includes(input.toLowerCase()) ||
      (translationsFr[key] && translationsFr[key].toLowerCase().includes(input.toLowerCase())) ||
      (translationsEn[key] && translationsEn[key].toLowerCase().includes(input.toLowerCase()))
    ).slice(0, 20);
    setSuggestions(filtered);
    setShowSuggestions(true);
  }, [translationsFr, translationsEn]);

  const debouncedFilter = useDebounce(filterSuggestions, 200);

  useEffect(() => {
    // Synchronise inputValue avec la clé courante
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedFilter(e.target.value);
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

  // Mettre à jour les suggestions si la valeur change de l'extérieur
  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else {
      debouncedFilter(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, translationsFr, translationsEn]);

  return (
    <div ref={anchorEl}>
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        margin={margin}
        fullWidth={fullWidth}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputProps={{
          endAdornment: (
            <IconButton
              aria-label="Créer la clé"
              onClick={() => {
                const newKey = toSnakeCase(inputValue);
                onChange(newKey);
                setShowSuggestions(false);
              }}
              edge="end"
              size="small"
              disabled={suggestions.length > 0 || !inputValue}
            >
              <AddIcon />
            </IconButton>
          )
        }}
      />
      <Popper
        open={isFocused && showSuggestions && suggestions.length > 0}
        anchorEl={anchorEl.current}
        placement="bottom-start"
        style={{ width: anchorEl.current?.offsetWidth, zIndex: 2000 }}
      >
        <Paper elevation={3}>
          <List>
            {suggestions.map((key, index) => (
              <ListItem
                key={key}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? 'action.selected' : 'inherit',
                  p: 0
                }}
                onClick={() => {
                  onChange(key);
                  setShowSuggestions(false);
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                      <Box sx={{ flex: 2, px: 1, py: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography variant="subtitle2" color="primary">{key}</Typography>
                      </Box>
                      <Box sx={{ flex: 3, px: 1, py: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">EN : {translationsEn[key]}</Typography>
                      </Box>
                      <Box sx={{ flex: 3, px: 1, py: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2">FR : {translationsFr[key]}</Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          {/* Bouton Créer la clé si aucune suggestion */}
          {inputValue && suggestions.length === 0 && (
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Aucune clé trouvée
              </Typography>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                onClick={() => {
                  const newKey = toSnakeCase(inputValue);
                  onChange(newKey);
                  setShowSuggestions(false);
                }}
              >
                Créer la clé « {toSnakeCase(inputValue)} »
              </Box>
            </Box>
          )}
        </Paper>
      </Popper>
      {/* Affichage des traductions dans les deux langues */}
      {value && (
        <>
          {translationsFr[value] && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, maxWidth: '100%' }}>
              FR : {translationsFr[value].length > 300 ? translationsFr[value].slice(0, 300) + '...' : translationsFr[value]}
            </Typography>
          )}
          {translationsEn[value] && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, maxWidth: '100%' }}>
              EN : {translationsEn[value].length > 300 ? translationsEn[value].slice(0, 300) + '...' : translationsEn[value]}
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default TranslationKeyField; 