export const formatRuleText = (text: string): string => {
  // Remplacer les sauts de ligne par des balises HTML
  return text.replace(/\n/g, '<br />');
}; 