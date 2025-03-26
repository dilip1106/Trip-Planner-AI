import { useState, useEffect } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock3 } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [localContent, setLocalContent] = useState(content || "");
  const { isSignedIn } = useAuth();
  const { user } = useUser();


  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

  useEffect(() => {
    if (content) {
      setLocalContent(content);
    }
  }, [content]);

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

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateBestTimeToVisitContent = async (updatedContent: string) => {
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
          bestTimeToVisit: updatedContent.trim()
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update content");
      }

      // Update local state after successful API call
      setLocalContent(updatedContent.trim());
      
      toast({
        description: "Best time to visit updated successfully!",
      });
      handleToggleEditMode();
    } catch (error) {
      console.error("Failed to update best time to visit:", error);
      toast({
        variant: "destructive",
        description: "Failed to update. Please try again.",
      });
      // Revert local state in case of error
      setLocalContent(content || "");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SectionWrapper id="besttimetovisit">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof localContent === "string" && localContent.length > 0}
        icon={<Clock3 className="mr-2" />}
        title="Best Time To Visit"
        isLoading={isLoading || isUpdating}
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
