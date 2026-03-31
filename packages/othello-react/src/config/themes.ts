/**
 * Board Theme System
 *
 * Themes apply CSS custom property overrides to :root.
 * The board and UI pick them up automatically.
 */

export interface Theme {
  id: string;
  name: string;
  /** CSS custom property overrides */
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'green',
    name: 'Classic Green',
    vars: {
      '--color-board-dark': '#2c5f2d',
      '--color-board-light': '#97d077',
      '--color-board-border': '#1a3d1a',
    },
  },
  {
    id: 'ocean',
    name: 'Blue Ocean',
    vars: {
      '--color-board-dark': '#1a4a6b',
      '--color-board-light': '#5ba3d9',
      '--color-board-border': '#0d2d42',
    },
  },
  {
    id: 'wood',
    name: 'Kaya Wood',
    vars: {
      '--color-board-dark': '#8b6914',
      '--color-board-light': '#d4a843',
      '--color-board-border': '#5c4510',
    },
  },
  {
    id: 'slate',
    name: 'Dark Slate',
    vars: {
      '--color-board-dark': '#2d2d3a',
      '--color-board-light': '#4a4a5e',
      '--color-board-border': '#1a1a24',
    },
  },
];

const STORAGE_KEY = 'othello-board-theme';

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0] ?? { id: 'green', name: 'Classic Green', vars: {} };
}

export function getSavedThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'green';
}

export function applyTheme(themeId: string): void {
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  // Clear previous theme board vars
  for (const t of THEMES) {
    for (const key of Object.keys(t.vars)) {
      root.style.removeProperty(key);
    }
  }
  // Apply new theme
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  localStorage.setItem(STORAGE_KEY, themeId);
}
