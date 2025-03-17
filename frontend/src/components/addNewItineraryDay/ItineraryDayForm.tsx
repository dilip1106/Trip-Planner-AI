import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "react-query"; // Replace Convex with React Query
import axios from "axios"; // Import axios
import { useAuth, useUser } from "@clerk/clerk-react"; // Import Clerk hooks

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useItineraryForm from "../hooks/useItineraryForm";

import { ItineraryValidationSchema } from "@/components/addNewItineraryDay/ItineraryValidationSchema";

import { Sun, Sunrise, Sunset } from "lucide-react";
import CustomTabContent from "@/components/addNewItineraryDay/CustomTabContent";
import { toast } from "@/components/ui/use-toast"; // Import toast

export type ItineraryType = z.infer<typeof ItineraryValidationSchema>["itinerary"];

type ItineraryDayFormProps = {
  planId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ItineraryDayForm = ({ planId, setOpen }: ItineraryDayFormProps) => {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    register,
    handleSubmit,
    handleTabChange,
    morningFields,
    afternoonFields,
    eveningFields,
    addNewControl,
    getFieldState,
    removeMorning,
    removeAfternoon,
    removeEvening,
    isValid,
    errors,
    isDirty,
  } = useItineraryForm(planId);

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

  const mutation = useMutation({
    mutationFn: async (data: { itinerary: ItineraryType }) => {
      setIsUpdating(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          throw new Error("Authentication required");
        }

        // First fetch existing itinerary
        const existingResponse = await axios.post(`http://localhost:5000/api/plan/${planId}/view`, {
          userData
        });
        const existingItinerary = existingResponse.data.data.itinerary || [];

        // Validate and prepare new data
        if (
          data.itinerary.activities.morning.length === 0 &&
          data.itinerary.activities.afternoon.length === 0 &&
          data.itinerary.activities.evening.length === 0
        ) {
          throw new Error("Please add at least one activity");
        }

        const updatedItinerary = [...existingItinerary, data.itinerary];

        const response = await axios.put(
          `http://localhost:5000/api/plan/${planId}`,
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
          throw new Error(response.data.error || "Failed to save itinerary");
        }

        return { ...response.data.data, updatedItinerary };
      } catch (error) {
        console.error("Failed to update itinerary:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['plan', planId], (oldData: any) => ({
        ...oldData,
        itinerary: data.updatedItinerary
      }));

      // Then invalidate to ensure consistency
      queryClient.invalidateQueries(['plan', planId]);
      
      setOpen(false);
      toast({
        description: "Itinerary saved successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to save itinerary",
      });
    }
  });

  // Add this near your other mutations
  const deleteMutation = useMutation({
    mutationFn: async (dayId: string) => {
      setIsUpdating(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          throw new Error("Authentication required");
        }
  
        // First fetch existing itinerary
        const existingResponse = await axios.post(`http://localhost:5000/api/plan/${planId}/view`, {
          userData
        });
        const existingItinerary = existingResponse.data.data.itinerary || [];
  
        // Filter out the day to be deleted
        const updatedItinerary = existingItinerary.filter((day: any) => day.id !== dayId);
  
        const response = await axios.put(
          `http://localhost:5000/api/plan/${planId}`,
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
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['plan', planId], (oldData: any) => ({
        ...oldData,
        itinerary: data.updatedItinerary
      }));
  
      // Then invalidate to ensure consistency
      queryClient.invalidateQueries(['plan', planId]);
      
      toast({
        description: "Itinerary day deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to delete itinerary day",
      });
    }
  });
  
  // Add this function to handle delete
  const handleDeleteDay = (dayId: string) => {
    if (window.confirm('Are you sure you want to delete this day?')) {
      deleteMutation.mutate(dayId);
    }
  };

  const onSaveEditList = async (data: { itinerary: ItineraryType }) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSaveEditList)} className="flex flex-col gap-1">
      <h2>New Day</h2>
      <Tabs defaultValue="morning" className="" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="morning">
            <Sunrise className="w-4 h-4 text-blue-500 mr-2" /> Morning
          </TabsTrigger>
          <TabsTrigger value="afternoon">
            <Sun className="w-4 h-4 text-yellow-500 mr-2" /> Afternoon
          </TabsTrigger>
          <TabsTrigger value="evening">
            <Sunset className="w-4 h-4 text-gray-600 mr-2" /> Evening
          </TabsTrigger>
        </TabsList>
        <CustomTabContent
          fields={morningFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="morning"
          register={register}
          remove={removeMorning}
        />

        <CustomTabContent
          fields={afternoonFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="afternoon"
          register={register}
          remove={removeAfternoon}
        />

        <CustomTabContent
          fields={eveningFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="evening"
          register={register}
          remove={removeEvening}
        />
      </Tabs>

      <div className="flex justify-start items-center gap-2 mt-5">
        <Button 
          size="sm" 
          variant="outline" 
          disabled={(!isValid && isDirty) || isUpdating}
          type="submit"
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
        <Button 
          onClick={() => setOpen(false)} 
          size="sm" 
          variant="outline"
          type="button"
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ItineraryDayForm;
