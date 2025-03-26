import { useState } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

type LocalCuisineRecommendationsProps = {
  recommendations: string[] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

export default function LocalCuisineRecommendations({
  recommendations,
  isLoading,
  planId,
  allowEdit,
}: LocalCuisineRecommendationsProps) {
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localRecommendations, setLocalRecommendations] = useState<string[]>(recommendations || []);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

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

  const updateLocalCuisines = async (updatedArray: string[]) => {
    setIsUpdating(true);
    try {
      const userData = getUserData();
      
      if (!userData) {
        throw new Error("Authentication required");
      }

      const response = await axios.put(
        `${BASE_URL}/api/plan/${planId}`,
        {
          userData,
          localCuisine: updatedArray
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update recommendations");
      }

      // Update local state after successful API call
      setLocalRecommendations(updatedArray);
      
      toast({
        description: "Recommendations updated successfully!",
      });
      handleToggleEditMode();
    } catch (error) {
      console.error("Failed to update recommendations:", error);
      toast({
        variant: "destructive",
        description: "Failed to update recommendations. Please try again.",
      });
      // Revert local state in case of error
      setLocalRecommendations(recommendations || []);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <SectionWrapper id="localcuisinerecommendations">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={localRecommendations != null && localRecommendations.length !== 0}
        icon={<Utensils className="mr-2" />}
        title="Local Cuisine Recommendations"
        isLoading={isLoading || isUpdating}
      />

      {!isLoading && localRecommendations ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={localRecommendations}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateLocalCuisines}
            />
          ) : (
            <List list={localRecommendations} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}
