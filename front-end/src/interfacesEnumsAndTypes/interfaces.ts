import { ReactNode } from "react";
import { ThemeState } from "./enums";

export interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeState;
};

export interface authContextProps {
    accessToken: string,
    setAccessToken: React.Dispatch<React.SetStateAction<string>>
};