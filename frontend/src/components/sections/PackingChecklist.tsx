import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Backpack } from "lucide-react";
import { useState } from "react";
import axios from "axios"; // Axios for backend communication

type PackingChecklistProps = {
  checklist: string[] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

export default function PackingChecklist({
  checklist,
  isLoading,
  planId,
  allowEdit,
}: PackingChecklistProps) {
  const [editMode, setEditMode] = useState(false);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateChecklist = async (updatedArray: string[]) => {
    try {
      await axios.put(`/api/plans/${planId}`, {
        key: "packingchecklist",
        data: updatedArray,
      });
      handleToggleEditMode();
    } catch (error) {
      console.error("Error updating packing checklist:", error);
    }
  };

  return (
    <SectionWrapper id="packingchecklist">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={checklist != null && checklist.length !== 0}
        icon={<Backpack className="mr-2" />}
        title="Packing Checklist"
        isLoading={isLoading}
      />

      {!isLoading && checklist ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={checklist}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateChecklist}
            />
          ) : (
            <List list={checklist} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}
