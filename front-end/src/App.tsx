import { useTheme } from "./Hooks/useTheme"
import { ThemeState } from "./interfacesEnumsAndTypes/enums";
import { ThemeContextType } from "./interfacesEnumsAndTypes/types";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import AppWrapper from "./Components/AppWrapper";

function App() {
  const { theme } : ThemeContextType = useTheme();

  return (
    <>
        <div className={`${theme === ThemeState.DARK ? "bg-black" : "bg-white"} min-h-screen w-full h-full`}>
          <AuthProvider>
            <BrowserRouter>
              <AppWrapper />
            </BrowserRouter>
          </AuthProvider>
        </div>
        
    </>
  )
}

export default App