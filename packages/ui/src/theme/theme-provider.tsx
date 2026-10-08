/**
 * NEXUS-232 Theme Provider
 * 
 * Manages global dynamic CSS custom properties:
 * - dark / light / high-contrast
 * - accent color
 * - density (compact / comfortable)
 * - UI scale
 * - panel opacity
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'high-contrast';
export type DensityMode = 'compact' | 'comfortable';

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
  density: DensityMode;
  uiScale: number;
  panelOpacity: number;
}

export interface ThemeContextValue extends ThemeConfig {
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: DensityMode) => void;
  setUiScale: (scale: number) => void;
  setPanelOpacity: (opacity: number) => void;
}

const defaultThemeConfig: ThemeConfig = {
  mode: 'dark',
  accentColor: '#38bdf8',
  density: 'compact',
  uiScale: 1.0,
  panelOpacity: 0.95
};

const ThemeContext = createContext<ThemeContextValue>({
  ...defaultThemeConfig,
  setMode: () => {},
  setAccentColor: () => {},
  setDensity: () => {},
  setUiScale: () => {},
  setPanelOpacity: () => {}
});

export const ThemeProvider: React.FC<{
  initialConfig?: Partial<ThemeConfig>;
  children: React.ReactNode;
}> = ({ initialConfig, children }) => {
  const [config, setConfig] = useState<ThemeConfig>({
    ...defaultThemeConfig,
    ...initialConfig
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', config.mode);
    root.setAttribute('data-density', config.density);
    root.style.setProperty('--nexus-accent', config.accentColor);
    root.style.setProperty('--nexus-scale', config.uiScale.toString());
    root.style.setProperty('--nexus-panel-opacity', config.panelOpacity.toString());
  }, [config]);

  const value: ThemeContextValue = {
    ...config,
    setMode: (mode) => setConfig((prev) => ({ ...prev, mode })),
    setAccentColor: (accentColor) => setConfig((prev) => ({ ...prev, accentColor })),
    setDensity: (density) => setConfig((prev) => ({ ...prev, density })),
    setUiScale: (uiScale) => setConfig((prev) => ({ ...prev, uiScale })),
    setPanelOpacity: (panelOpacity) => setConfig((prev) => ({ ...prev, panelOpacity }))
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
