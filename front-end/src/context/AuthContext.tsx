import { createContext, useState } from "react";
import { authContextProps } from "../interfacesEnumsAndTypes/interfaces";

  export const AuthContext = createContext<authContextProps | undefined>(undefined);

  export const AuthProvider  = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string>('');

    const authValue = {
      accessToken,
      setAccessToken
    }

    return(
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    )

  }

