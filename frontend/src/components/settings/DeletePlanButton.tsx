import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useUser } from "@clerk/clerk-react";

import { Loading } from "@/components/shared/Loading";
import { AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DeletePlanButtonProps {
  planId?: string;
}

export default function DeletePlanButton({ planId }: DeletePlanButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isSignedIn, user } = useUser();
  
  // Function to get user data for the backend
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
  
  const handleDeletePlan = async () => {
    try {
      setIsDeleting(true);
      
      const userData = getUserData();
      
      if (!userData) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }
      
      const { id, dismiss } = toast({
        title: "Deleting Plan",
        description: "Your plan is being deleted. Please wait...",
      });
      
      // Changed from POST to DELETE request to match controller expectation
      await axios.delete(
        `http://localhost:5000/api/plan/${planId}/delete`,
        { data: { userData } } // For DELETE requests, body must be in "data" property
      );
      
      dismiss();
      
      // Redirect to dashboard after successful deletion
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = 
        (error instanceof AxiosError && error.response?.data?.error) ||
        (error instanceof Error ? error.message : 'Something went wrong!');
      
      toast({
        title: "Not Allowed",
        variant: "destructive",
        description: errorMessage,
      });
      
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction asChild className="destructive">
        <Button
          variant="destructive"
          className="bg-red-500 text-white hover:text-white hover:bg-red-700
                    flex gap-2 justify-center items-center"
          disabled={isDeleting}
          onClick={handleDeletePlan}
        >
          {isDeleting && <Loading className="h-4 w-4 text-white" />}
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </Button>
      </AlertDialogAction>
    </>
  );
}