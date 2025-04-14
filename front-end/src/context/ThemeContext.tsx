import { createContext, useState } from "react";
import { ThemeState } from "../interfacesEnumsAndTypes/enums";
import { ThemeProviderProps } from "../interfacesEnumsAndTypes/interfaces";
import { ThemeContextType } from "../interfacesEnumsAndTypes/types";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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