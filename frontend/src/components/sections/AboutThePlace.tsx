import SectionWrapper from "@/components/sections/SectionWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

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
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  // Update local state when content prop changes
  useEffect(() => {
    setAboutContent(content);
  }, [content]);

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

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateAboutThePlaceContent = async (updatedContent: string) => {
    setIsUpdating(true);
    try {
      const userData = getUserData();
      
      if (!userData) {
        throw new Error("Authentication required");
      }
      
      // Include userData in the request body as expected by your middleware
      const response = await axios.put(
        `http://localhost:5000/api/plan/${planId}`,
        { 
          userData,
          aboutThePlace: updatedContent.trim()
        }
      );

      if (response.data.success) {
        setAboutContent(updatedContent.trim());
        handleToggleEditMode();
      } else {
        throw new Error(response.data.error || "Failed to update About the Place content.");
      }
    } catch (error) {
      console.error("Update error:", error);
      // You might want to show an error message to the user here
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