import { useContext, ReactNode } from 'react';
import { ThemeContext, ThemeContextType } from '../context/ThemeContext';

export enum ThemeState {
  DARK,
  LIGHT
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeState;
}


export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
