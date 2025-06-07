import React, { createContext, useContext, useState } from 'react';

interface LanguageContextProps {
  lang: 'fr' | 'en';
  setLang: (lang: 'fr' | 'en') => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: 'fr',
  setLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'fr' | 'en'>(
    (localStorage.getItem('lang') as 'fr' | 'en') || 'fr'
  );

  const changeLang = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}; 