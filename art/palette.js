// Цвета взяты из тайлсета мира Тыкворкинга (office-chunk-1/2-12e06587.png), кроме отмеченных.
export const PALETTE = {
  // контур персонажей и предметов
  outline: '#2e1101',
  outline2: '#41230a',
  // тыквы, стены, вывески
  pumpkin: '#e8843c',
  pumpkinLight: '#fcac15',
  pumpkinGlow: '#ffa92a',
  pumpkinShade: '#c4562f',
  pumpkinDark: '#d36d33',
  wallLight: '#f1a15a',
  // зелень: стебли, текст вывесок
  leaf: '#58683b',
  leafLight: '#72864e',
  sage: '#a8b58a',
  sageDark: '#96a07e',
  // кремовый пол, бумага, белый корпус
  cream: '#fff7ec',
  paper: '#feead1',
  paperShade: '#e7c9a0',
  paperDark: '#d7b593',
  white: '#ffffff',
  // столы: светлое дерево и серая рама
  wood: '#e5e0ae',
  woodGrain: '#dfd891',
  woodDark: '#bf9972',
  frame: '#a1a1a1',
  frameLight: '#dbdbdb',
  frameDark: '#616161',
  steel: '#475052',
  ink: '#2b2b2b',
  coal: '#3d3d3d',
  // провода и мелочи
  red: '#fc4a41',
  blue: '#5b6ee1',
  // не из мира: зелёный люминофор экрана Fabbit
  screenGreen: '#7dff8f',
  screenDim: '#2f6b3a',
};

export const OPAQUE = new Set(Object.values(PALETTE));
