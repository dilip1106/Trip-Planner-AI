import { useState, useEffect } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Sailboat } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

type TopActivitiesProps = {
  activities: string[] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

export default function TopActivities({
  activities,
  planId,
  isLoading,
  allowEdit,
}: TopActivitiesProps) {
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localActivities, setLocalActivities] = useState<string[]>(activities || []);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (activities) {
      setLocalActivities(activities);
    }
  }, [activities]);

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

  const updateActivitiesToDo = async (updatedArray: string[]) => {
    setIsUpdating(true);
    try {
      const userData = getUserData();
      
      if (!userData) {
        throw new Error("Authentication required");
      }

      // console.log("Sending update to backend:", {
      //   endpoint: `http://localhost:5000/api/plan/${planId}`,
      //   payload: {
      //     userData,
      //     activitiesToDo: updatedArray,
      //     planId: planId
      //   }
      // });

      // First update the database
      const response = await axios.put(
        `http://localhost:5000/api/plan/${planId}`,
        {
          userData,
          
          adventureActivities: updatedArray,
          
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Backend response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update activities");
      }

      // If database update is successful, update local state
      setLocalActivities(updatedArray);
      
      toast({
        description: "Activities updated successfully!",
      });
      handleToggleEditMode();

      return response.data;
    } catch (error) {
      console.error("Failed to update activities:", error);
      toast({
        variant: "destructive",
        description: "Failed to update activities. Please try again.",
      });
      // Revert local state in case of error
      setLocalActivities(activities || []);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <SectionWrapper id="adventuresactivitiestodo">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={localActivities != null && localActivities.length !== 0}
        icon={<Sailboat className="mr-2" />}
        title="Top activities to look for"
        isLoading={isLoading || isUpdating}
      />
      {!isLoading ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={localActivities}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateActivitiesToDo}
            />
          ) : (
            <List list={localActivities} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}