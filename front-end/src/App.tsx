import { useTheme } from "./Hooks/useTheme"
import { ThemeState } from "./interfacesEnumsAndTypes/enums";
import { ThemeContextType } from "./interfacesEnumsAndTypes/types";
import DocumentUploader from "./Components/DocumentUploader";
import { BrowserRouter, Route, Routes } from "react-router";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import RegisterPage from "./Components/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./Components/ui/SideBar";
import ChatPage from "./Components/ui/ChatPage";

function App() {
  const { theme } : ThemeContextType = useTheme();

  return (
    <>
        <div className={`${theme === ThemeState.DARK ? "bg-black" : "bg-white"} min-h-screen w-full h-full`}>
          <AuthProvider>
            <BrowserRouter>
            <Sidebar>
              <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/upload" element={<DocumentUploader />}/> 
                <Route path="/chat" element={<ChatPage/>} />
              </Routes>
              </Sidebar>
            </BrowserRouter>
            
          </AuthProvider>
        </div>
        
    </>
  )
}

export default App