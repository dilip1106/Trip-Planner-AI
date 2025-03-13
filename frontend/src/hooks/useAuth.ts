import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

const DASHBOARD_URL = "/dashboard";

const useAuthHook = () => {
  const { isAuthenticated, isLoading, openSignIn } = useAuth(); // Use useAuth to access isAuthenticated and isLoading
  const [isCurrentPathDashboard, setIsCurrentPathDashboard] = useState(false);
  const [isCurrentPathHome, setIsCurrentPathHome] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsCurrentPathDashboard(location.pathname === DASHBOARD_URL);
    setIsCurrentPathHome(location.pathname === "/");
  }, [location.pathname]);

  const openSignInPopupOrDirect = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      openSignIn({ redirectUrl: DASHBOARD_URL });
      return;
    }
    navigate(DASHBOARD_URL);
  };

  return { isCurrentPathDashboard, isCurrentPathHome, openSignInPopupOrDirect, isAuthenticated };
};

export default useAuthHook;
