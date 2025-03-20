import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
//   const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
    const {planId} = useParams();
  const getUserData = () => {
    if (!isSignedIn || !user) return null;
    
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    return {
      clerkId: user.id,
      email: primaryEmail || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      image: user.imageUrl
    };
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!isSignedIn || !user || !planId) {
        setIsLoading(false);
        setIsAuthorized(false);
        return;
      }

      try {
        const userData = getUserData();
        if (!userData) {
          throw new Error("User data not available");
        }

        const response = await axios.post(
          `http://localhost:5000/api/plan/${planId}/check-access`,
          { userData }
        );
        console.log(response.data.hasAccess)
        // Check if response has the expected format
        if (response.data && response.data.success && typeof response.data.hasAccess === 'boolean') {
          setIsAuthorized(response.data.hasAccess);
          console.log('Access status:', response.data.hasAccess); // Debug log
        } else {
          console.log('Invalid response format:', response.data); // Debug log
          setIsAuthorized(false);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Access check failed:", error.response?.data);
        } else {
          console.error("Access check failed:", error);
        }
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [isSignedIn, user, planId]);

  // Add debug log for state changes
  useEffect(() => {
    console.log('Authorization state:', { isAuthorized, isLoading });
  }, [isAuthorized, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn || !isAuthorized) {
    console.log('Redirecting: Not signed in or not authorized'); // Debug log
    navigate('/');
  }

  return <>{children}</>;
}