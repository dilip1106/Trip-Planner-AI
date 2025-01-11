import SectionWrapper from "@/components/sections/SectionWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { useState } from "react";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";

type AboutThePlaceProps = {
  content: string | undefined;
  isLoading: boolean;
  planId: string;
  allowEdit: boolean;
};

export default function AboutThePlace({ content, isLoading, planId, allowEdit }: AboutThePlaceProps) {
  const [editMode, setEditMode] = useState(false);
  const [aboutContent, setAboutContent] = useState(content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateAboutThePlaceContent = async (updatedContent: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/plans/${planId}/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abouttheplace: updatedContent.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update About the Place content.");
      }

      setAboutContent(updatedContent.trim());
      handleToggleEditMode();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SectionWrapper id="abouttheplace">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof aboutContent === "string" && aboutContent.length > 0}
        icon={<Info className="mr-2" />}
        title="About the Place"
        isLoading={isLoading || isUpdating}
      />
      <div className="ml-8">
        {!isLoading ? (
          editMode ? (
            <EditText
              content={aboutContent ?? ""}
              toggleEditMode={handleToggleEditMode}
              updateContent={updateAboutThePlaceContent}
            />
          ) : (
            aboutContent || (
              <div className="flex justify-center items-center">
                Click + to add about the place
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
