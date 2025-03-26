import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { z } from "zod";
import { useMutation, QueryClient, useQuery } from "react-query";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useItineraryForm from "../hooks/useItineraryForm";

import { ItineraryValidationSchema } from "@/components/addNewItineraryDay/ItineraryValidationSchema";

import { Sun, Sunrise, Sunset } from "lucide-react";
import CustomTabContent from "@/components/addNewItineraryDay/CustomTabContent";
import { toast } from "@/components/ui/use-toast";

const NODE_URI=import.meta.env.VITE_NODE_ENV;
const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

export type ItineraryType = z.infer<typeof ItineraryValidationSchema>["itinerary"];

type ItineraryDayFormProps = {
  planId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  queryClient: QueryClient;
};

const ItineraryDayForm = ({ planId, setOpen, queryClient }: ItineraryDayFormProps) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [nextDayNumber, setNextDayNumber] = useState(1);
  
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
  
  // Use React Query to get the current itinerary data
  useQuery(
    ['plan', planId],
    async () => {
      const userData = getUserData();
      if (!userData) throw new Error("Authentication required");

      const response = await axios.post(`${BASE_URL}/api/plan/${planId}/view`, {
        userData
      });

      return response.data.data;
    },
    {
      enabled: !!planId && isSignedIn,
      onSuccess: (data) => {
        // Calculate the next day number based on existing itinerary
        if (data?.itinerary?.length > 0) {
          // Try to find day numbers in the existing day titles
          const dayNumbers = data.itinerary.map((day: any) => {
            const match = day.title.match(/Day\s+(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
          });

          // Find the maximum day number
          const maxDayNumber = Math.max(...dayNumbers, 0);
          setNextDayNumber(maxDayNumber + 1);
        } else {
          setNextDayNumber(1);
        }
      }
    }
  );
  
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
    setValue
  } = useItineraryForm();
  
  // Set the title to "Day X" when the form initializes
  useEffect(() => {
    setValue("itinerary.title", `Day ${nextDayNumber}`);
  }, [nextDayNumber, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: { itinerary: ItineraryType }) => {
      setIsUpdating(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          throw new Error("Authentication required");
        }

        // First fetch existing itinerary
        const existingResponse = await axios.post(`${BASE_URL}/api/plan/${planId}/view`, {
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

        // Ensure the title is set to "Day X"
        if (!data.itinerary.title.startsWith("Day ")) {
          data.itinerary.title = `Day ${nextDayNumber}`;
        }

        const updatedItinerary = [...existingItinerary, data.itinerary];

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

  const onSaveEditList = async (data: { itinerary: ItineraryType }) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSaveEditList)} className="flex flex-col gap-1">
      <h2>Day {nextDayNumber}</h2>
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