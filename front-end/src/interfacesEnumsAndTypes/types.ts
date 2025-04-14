import { ThemeState } from "./enums";

export type ThemeContextType = {
  theme: ThemeState;
  setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;
  toggleTheme: () => void;
};