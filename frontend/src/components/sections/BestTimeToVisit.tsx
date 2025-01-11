import SectionWrapper from "@/components/sections/SectionWrapper";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock3 } from "lucide-react";
import { useState } from "react";

type BestTimeToVisitProps = {
  content: string | undefined;
  isLoading: boolean;
  planId: string;
  allowEdit: boolean;
};

export default function BestTimeToVisit({
  content,
  isLoading,
  planId,
  allowEdit,
}: BestTimeToVisitProps) {
  const [editMode, setEditMode] = useState(false);
  const [localContent, setLocalContent] = useState(content || ""); // Use local state for content

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateBestTimeToVisitContent = (updatedContent: string) => {
    setLocalContent(updatedContent.trim()); // Update local state
    handleToggleEditMode(); // Exit edit mode
  };

  return (
    <SectionWrapper id="besttimetovisit">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof localContent === "string" && localContent.length > 0}
        icon={<Clock3 className="mr-2" />}
        title="Best Time To Visit"
        isLoading={isLoading}
      />
      <div className="ml-8">
        {!isLoading ? (
          editMode ? (
            <EditText
              content={localContent}
              toggleEditMode={handleToggleEditMode}
              updateContent={updateBestTimeToVisitContent}
            />
          ) : (
            localContent || (
              <div className="flex justify-center items-center">
                Click + to add the best time to visit
              </div>
            )
          )
        ) : (
          <Skeleton className="w-full h-full" />
        )}
      </div>
    </SectionWrapper>
  );
}
