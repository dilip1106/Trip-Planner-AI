import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils } from "lucide-react";
import { useState } from "react";

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

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateLocalCuisines = async (updatedArray: string[]) => {
    try {
      const response = await fetch(`/api/updateLocalCuisines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          data: updatedArray,
          key: "localcuisinerecommendations",
        }),
      });

      if (response.ok) {
        handleToggleEditMode();
      } else {
        console.error("Failed to update local cuisine recommendations");
      }
    } catch (error) {
      console.error("Error updating local cuisine recommendations:", error);
    }
  };

  return (
    <SectionWrapper id="localcuisinerecommendations">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={recommendations != null && recommendations.length != 0}
        icon={<Utensils className="mr-2" />}
        title="Local Cuisine Recommendations"
        isLoading={isLoading}
      />

      {!isLoading && recommendations ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={recommendations}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateLocalCuisines}
            />
          ) : (
            <List list={recommendations} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}
