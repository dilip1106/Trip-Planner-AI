import { useState, useEffect } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import { Skeleton } from "@/components/ui/skeleton";
import { Backpack } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [localChecklist, setLocalChecklist] = useState<string[]>(checklist || []);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (checklist) {
      setLocalChecklist(checklist);
    }
  }, [checklist]);

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

  const updateChecklist = async (updatedArray: string[]) => {
    setIsUpdating(true);
    try {
      const userData = getUserData();
      
      if (!userData) {
        throw new Error("Authentication required");
      }

      const response = await axios.put(
        `http://localhost:5000/api/plan/${planId}`,
        {
          userData,
          packingChecklist: updatedArray
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update checklist");
      }

      // Update local state after successful API call
      setLocalChecklist(updatedArray);
      
      toast({
        description: "Checklist updated successfully!",
      });
      handleToggleEditMode();
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast({
        variant: "destructive",
        description: "Failed to update checklist. Please try again.",
      });
      // Revert local state in case of error
      setLocalChecklist(checklist || []);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SectionWrapper id="packingchecklist">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={localChecklist != null && localChecklist.length !== 0}
        icon={<Backpack className="mr-2" />}
        title="Packing Checklist"
        isLoading={isLoading || isUpdating}
      />

      {!isLoading && localChecklist ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={localChecklist}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateChecklist}
            />
          ) : (
            <List list={localChecklist} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}
