import React from 'react';

export class TextFormatService {
  /**
   * Formate le texte en mettant en évidence le contenu entre **
   * @param text Le texte à formater
   * @returns Un tableau d'éléments React avec le texte formaté
   */
  static formatRuleText(text: string): React.ReactNode[] {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return React.createElement(
          'span',
          {
            key: index,
            style: { fontWeight: 'bold' }
          },
          `[${content}]`
        );
      }
      return part;
    });
  }

  /**
   * Formate le texte en ajoutant des retours à la ligne après chaque caractère ■
   * @param text Le texte à formater
   * @returns Un tableau d'éléments React avec le texte formaté
   */
  static formatTextWithLineBreaks(text: string): React.ReactNode[] {
    if (!text.includes('■')) return [text];
    
    const parts = text.split('■').map(part => part.trim());
    return parts.map((part, index) => {
      if (index === 0) return part;
      return [
        React.createElement('br', { key: `br-${index}` }),
        `■ ${part}`
      ];
    }).flat();
  }

  /**
   * Formate le texte en liste avec ■ au début de chaque ligne
   * @param text Le texte à formater
   * @returns Un tableau d'éléments React avec le texte formaté en liste
   */
  static formatTextWithLineBreaksList(text: string): React.ReactNode[] {
    if (!text) return [];
    
    const parts = text.split('■').map(part => part.trim()).filter(part => part);
    if (parts.length === 0) return [];

    return parts.map((part, index) => {
      return [
        index > 0 ? React.createElement('br', { key: `br-${index}` }) : null,
        `■ ${part}`
      ];
    }).flat().filter(Boolean);
  }

  /**
   * Formate le texte en liste avec ■ au début de chaque ligne et options sur 2 colonnes sous chaque titre principal
   * @param text Le texte à formater
   * @returns Un tableau d'éléments React avec le texte formaté en liste à 2 colonnes
   */
  static formatTextWithTwoColumnOptionsList(text: string): React.ReactNode[] {
    if (!text) return [];
    const blocks = text.split('■').map(part => part.trim()).filter(Boolean);
    if (blocks.length === 0) return [];

    return blocks.map((block, blockIdx) => {
      // Séparer le titre principal et les options (◦)
      const [main, ...options] = block.split('◦').map(s => s.trim()).filter(Boolean);
      return [
        blockIdx > 0 ? React.createElement('br', { key: `br-block-${blockIdx}` }) : null,
        React.createElement('span', { key: `main-${blockIdx}`, style: { fontWeight: 'bold', display: 'block', marginBottom: options.length ? 4 : 0 } }, `■ ${main}`),
        options.length > 0 && React.createElement(
          'div',
          {
            key: `options-${blockIdx}`,
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginLeft: 16, marginTop: 2, marginBottom: 8 }
          },
          options.map((opt, optIdx) =>
            React.createElement('span', { key: `opt-${blockIdx}-${optIdx}`, style: { fontWeight: 400 } }, opt)
          )
        )
      ];
    }).flat().filter(Boolean);
  }
} 