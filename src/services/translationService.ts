import { useLanguage } from '../contexts/LanguageContext';
import { useDatasource } from '../contexts/DatasourceContext';

// Hook à utiliser dans les composants React
export function useTranslate() {
  const { lang } = useLanguage();
  const { datasource } = useDatasource();
  return (key: string, factionKey: string) => {
    if (!datasource) {
      return key;
    }
    const flatKey = `${factionKey}_flat_${lang}`;
    const value = datasource[flatKey]?.[key];
    if (value) return value;
    return key;
  };
} 