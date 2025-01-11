import { useState, useEffect } from "react";
import { MapPinIcon } from "lucide-react";
import { useNavigate } from "react-router-dom"; // react-router-dom hook for navigation

// Mock of authentication state. Replace with actual logic.
const useAuth = () => {
  const [authState, setAuthState] = useState<string | null>(null); // null, "authenticated", "unauthenticated"

  useEffect(() => {
    // Simulate an API call to check if the user is authenticated
    const checkAuth = async () => {
      // Simulating an API call or fetching from your backend to determine authentication status
      const response = await fetch("/api/auth/status"); // replace with your real API endpoint
      const data = await response.json();
      if (data.isAuthenticated) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    };

    checkAuth(); // Trigger authentication check on component mount
  }, []);

  return authState;
};

const Logo = () => {
  const authState = useAuth(); // Using the custom hook to get the auth state
  const navigate = useNavigate(); // Access the navigate function from react-router-dom

  const handleClick = () => {
    if (authState === "authenticated") {
      navigate("/dashboard"); // Navigate to the dashboard if authenticated
    } else {
      navigate("/"); // Navigate to home if unauthenticated
    }
  };

  

  return (
    <div className="hidden md:flex gap-10 items-center justify-start flex-1">
      <div onClick={handleClick} className="flex gap-1 justify-center items-center cursor-pointer">
        <MapPinIcon className="h-10 w-10 text-blue-500" />
        <div className="flex flex-col leading-5 font-bold text-xl">
          <span>Travel</span>
          <span>
            Planner
            <span className="text-blue-500 ml-0.5">AI</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
