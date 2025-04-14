import { ReactNode } from "react";
import { ThemeState } from "./enums";

export interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeState;
};

export interface authContextProps {
    userId : string,
    uuid : string,
    loggedIn : boolean,
};