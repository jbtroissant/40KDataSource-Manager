import { useLanguage } from '../contexts/LanguageContext';
import { useDatasource } from '../contexts/DatasourceContext';

// Fonction utilitaire pour traduire avec une langue spécifiée
export function translateWithLang(datasource: any, key: string, factionKey: string, lang: string) {
  if (!datasource) {
    return key;
  }
  const flatKey = `${factionKey}_flat_${lang}`;
  const value = datasource[flatKey]?.[key];
  if (value) return value;
  for (const k of Object.keys(datasource)) {
    if (k.endsWith(`_flat_${lang}`) && datasource[k]?.[key]) {
      return datasource[k][key];
    }
  }
  return key;
}

// Hook à utiliser dans les composants React
export function useTranslate() {
  const { lang } = useLanguage();
  const { datasource } = useDatasource();
  return (key: string, factionKey: string) => {
    return translateWithLang(datasource, key, factionKey, lang);
  };
} 