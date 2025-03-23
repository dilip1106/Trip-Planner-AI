import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import joinNow from "@/assets/join-now.svg";

interface ToastProps {
  title: string;
  description: string;
}

const Join = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const {token} = useParams();
  const [isProcessing, setIsProcessing] = useState(true);

  // Simple toast implementation since we're not using the UI library
  const toast = (props: ToastProps) => {
    console.error(`${props.title}: ${props.description}`);
    // You can replace this with your actual toast implementation
    alert(`${props.title}: ${props.description}`);
  };

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
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/");
      return;
    }

    const acceptInvite = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid invitation token",
        });
        navigate("/");
        return;
      }

      setIsProcessing(true);
      try {
        const userData = getUserData();
        if (!userData) {
          toast({
            title: "Error",
            description: "User data not available",
          });
          navigate("/");
          return;
        }
        
        const response = await axios.post(`http://localhost:5000/api/plan/invite/accept/${token}`, {
          userData
        });
        
        const planId = response.data.planId;
        navigate(`/plan/${planId}`);
      } catch (error: any) {
        console.error(error);
        // toast({
        //   title: "Error",
        //   description: error.response?.data?.message || "Failed to accept invitation",
        // });
        // navigate("/");
      } finally {
        setIsProcessing(false);
      }
    };

    acceptInvite();
  }, [isLoaded, isSignedIn, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <img src={joinNow} alt="Join Now" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Joining the Plan...</h1>
        {isProcessing && <p className="text-gray-600">Please wait while we process your invitation.</p>}
      </div>
    </div>
  );
};

export default Join;