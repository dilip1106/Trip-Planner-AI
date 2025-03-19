// src/components/DangerZone.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import DeletePlanButton from "./DeletePlanButton";
  
  interface DangerZoneProps {
    planId?: string;
  }
  
  export default function DangerZone({ planId }: DangerZoneProps) {
    return (
      <article className="bg-background shadow-sm rounded-lg p-4 border-2 border-border">
        <h2 className="border-b-2 border-b-border pb-2 mb-2 font-bold">Danger Zone</h2>
        
        <h3 className="text-neutral-500 dark:text-neutral-400 mb-4 flex text-sm sm:text-base">
          You can delete your travel plan but please be informed that it cannot be recovered.
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Travel Plan</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Travel Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Please type Delete to delete this plan. After deletion, it cannot be recovered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DeletePlanButton planId={planId} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </article>
    );
  }