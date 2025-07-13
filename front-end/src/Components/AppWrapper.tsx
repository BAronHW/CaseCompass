import { Route, Routes, useLocation } from "react-router";
import Sidebar from "./ui/SideBar";
import DocumentUploader from "./DocumentUploader";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ChatPage from "./ui/ChatPage";
import DocumentPage from "./ui/DocumentPage";
import AuthProvider from "../context/AuthContext";

export default function AppWrapper() {
    const location = useLocation();
    const noSidebarPages = ['/', '/login', '/register'];
    const showSidebar = !noSidebarPages.includes(location.pathname);
  return (
    <>
        {showSidebar ? (
        <AuthProvider>
        <Sidebar>
          <Routes>
            <Route path="/upload" element={<DocumentUploader />}/> 
            <Route path="/chat" element={<ChatPage/>} />
            <Route path="/documents" element={<DocumentPage/>}/>
          </Routes>
        </Sidebar>
        </AuthProvider>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="/login" element={<LoginPage />}/>
        </Routes>
      )}
    </>
  )
}
