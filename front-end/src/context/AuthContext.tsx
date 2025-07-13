// need to flesh this out
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("Authorization");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthProvider;
