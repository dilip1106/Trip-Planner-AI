import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, QueryClient } from "react-query";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "@/components/ui/use-toast";


type ItineraryDayHeaderProps = {
  title: string;
  planId: string;
  allowEdit: boolean;
  dayId?: string;
  queryClient?: QueryClient;
};

export default function ItineraryDayHeader({ 
  title, 
  planId, 
  allowEdit,
  dayId,
  queryClient 
}: ItineraryDayHeaderProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const userData = getUserData();
        
        if (!userData) {
          throw new Error("Authentication required");
        }
  
        // First try to use the API that already exists in your codebase
        try {
          const response = await fetch(`/api/plans/${planId}/deleteDay`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dayName: title }),
          });
          
          if (response.ok) {
            return await response.json();
          }
        } catch (err) {
          console.log("Existing API failed, falling back to direct method");
        }
        
        // Fallback to direct method if the API call fails
        // First fetch existing itinerary
        const existingResponse = await axios.post(`${BASE_URL}/api/plan/${planId}/view`, {
          userData
        });
        const existingItinerary = existingResponse.data.data.itinerary || [];
  
        // Filter out the day to be deleted
        // Either use day.id if available or filter by title
        const updatedItinerary = existingItinerary.filter((day: any) => {
          if (dayId) return day.id !== dayId;
          return day.title !== title;
        });
  
        const response = await axios.put(
          `${BASE_URL}/api/plan/${planId}`,
          {
            userData,
            itinerary: updatedItinerary
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to delete itinerary day");
        }
  
        return { ...response.data.data, updatedItinerary };
      } catch (error) {
        console.error("Failed to delete itinerary day:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (queryClient) {
        // Update the cache with new data
        queryClient.setQueryData(['plan', planId], (oldData: any) => {
          if (!oldData) return { itinerary: data.updatedItinerary };
          return {
            ...oldData,
            itinerary: data.updatedItinerary
          };
        });
    
        // Then invalidate to ensure consistency
        queryClient.invalidateQueries(['plan', planId]);
      }
      
      toast({
        description: `Successfully deleted ${title}`,
      });
      
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || `Failed to delete ${title}`,
      });
    }
  });

  return (
    <div className="flex justify-between mb-2 text-lg font-bold leading-2 text-foreground ">
      <span>{title}</span>
      {allowEdit && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger>
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="p-1 rounded-full bg-background/50"
              onClick={() => setOpen(true)}
            >
              <TrashIcon className="h-6 w-6 text-red-500 dark:text-foreground dark:hover:text-red-500 hover:scale-105 transition-all duration-300" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the day from your
                Itinerary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}