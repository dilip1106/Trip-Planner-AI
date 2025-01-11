import React, { useState } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Sailboat } from "lucide-react";

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

  // Mock update function to simulate API call
  const updateActivitiesToDo = (updatedArray: string[]) => {
    console.log("Updated activities:", updatedArray);
    console.log("Plan ID:", planId);
    console.log("Key: adventuresactivitiestodo");

    // Simulate API delay
    setTimeout(() => {
      handleToggleEditMode();
    }, 1000);
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <SectionWrapper id="adventuresactivitiestodo">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={activities != null && activities.length !== 0}
        icon={<Sailboat className="mr-2" />}
        title="Top activities to look for"
        isLoading={isLoading}
      />
      {!isLoading && activities ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={activities}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateActivitiesToDo}
            />
          ) : (
            <List list={activities} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}
