
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ItineraryDayHeaderProps = {
  title: string;
  planId: string;
  allowEdit: boolean;
};

export default function ItineraryDayHeader({ title, planId, allowEdit }: ItineraryDayHeaderProps) {
  const [open, setOpen] = useState(false);

  const deleteDayInItinerary = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}/deleteDay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dayName: title }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete the day.");
      }

      // Handle successful deletion
      // (e.g., update state or show a toast notification)
      alert(`Successfully deleted ${title}`);
    } catch (error) {
      console.error("Error deleting the day:", error);
      // Handle error (show an error message or toast notification)
    }
  };

  return (
    <div className="flex justify-between mb-2 text-lg font-bold leading-2 text-foreground ">
      <span>{title}</span>
      {allowEdit && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger>
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="p-1 rounded-full bg-background/50"
              onClick={() => setOpen(true)}
            >
              <TrashIcon className="h-6 w-6 text-red-500 dark:text-foreground dark:hover:text-red-500 hover:scale-105 transition-all duration-300" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the day from your
                Itinerary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteDayInItinerary}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
