import { useTheme } from "./Hooks/useTheme"
import { ThemeState } from "./interfacesEnumsAndTypes/enums";
import { ThemeContextType } from "./interfacesEnumsAndTypes/types";
import DocumentUploader from "./Components/DocumentUploader";
import { BrowserRouter, Route, Routes } from "react-router";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import RegisterPage from "./Components/RegisterPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const { theme } : ThemeContextType = useTheme();

  return (
    <>
        <div className={`${theme === ThemeState.DARK ? "bg-black" : "bg-white"} min-h-screen w-full h-full`}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/upload" element={<DocumentUploader />}/> 
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </div>
        
    </>
  )
}

export default App