export const stratagemConfig = {
  // Dimensions des bandes
  sideBandWidth: 30,
  horizontalBandHeight: 2,
  
  // Dimensions du losange
  diamondSize: 50,
  diamondBorderWidth: 2,
  
  // Espacements
  diamondSpacing: 80, // Réduit de 50 à 45 pour rapprocher les losanges
  titleTopSpacing: 8,
  contentLeftSpacing: 90,
  horizontalBandTopPosition: 40,
  
  // Espacements des losanges
  diamondTopSpacing: 16, // Espacement en haut du premier losange
  diamondLeftSpacing: 8, // Espacement à gauche des losanges (par rapport à la bande verticale)
  
  // Dimensions de la carte
  cardHeight: 500, // Augmenté de 500 à 550 pour accommoder jusqu'à 3 losanges
  
  // Couleurs des stratagèmes selon le tour
  colors: {
    either: '#2c594c',
    your: '#234461',
    opponents: '#a2151a'
  },

  // URLs des icônes de phase
  phaseIconBaseUrl: 'https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/10th',
  phaseIconSize: 30, // Taille de l'icône dans le losange
} as const;

export type StratagemTurn = keyof typeof stratagemConfig.colors; 