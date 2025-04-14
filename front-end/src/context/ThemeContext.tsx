import { createContext, useState } from "react";
import { ThemeProviderProps, ThemeState } from "../Hooks/useTheme";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export type ThemeContextType = {
  theme: ThemeState;
  setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;
  toggleTheme: () => void;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
    children, 
    defaultTheme = ThemeState.DARK 
  }) => {
    const [theme, setTheme] = useState<ThemeState>(defaultTheme);
    
    const toggleTheme = () => {
      setTheme(currentTheme => 
        currentTheme === ThemeState.DARK ? ThemeState.LIGHT : ThemeState.DARK
      );
    };
  
    const value = {
      theme,
      setTheme,
      toggleTheme
    };
  
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  };