import { useState } from "react";
import { formSchemaType } from "@/components/NewPlanForm";
import { differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export async function generatePlanAction(formData: formSchemaType) {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { placeName, activityPreferences, datesOfTravel, companion } = formData;

  // Calculate the number of days between travel dates
  const noOfDays: string = differenceInDays(datesOfTravel.to, datesOfTravel.from).toString();

  try {
    // Call the backend API to create the plan
    const response = await fetch("/api/create-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeName,
        noOfDays,
        activityPreferences,
        fromDate: datesOfTravel.from.getTime(),
        toDate: datesOfTravel.to.getTime(),
        companion,
        isGeneratedUsingAI: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create the plan");
    }

    const { planId }: { planId: string } = await response.json();

    if (planId) {
      // Trigger image generation using AI
      await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: placeName,
          planId,
        }),
      });

      // Trigger batch preparation
      await Promise.all([
        fetch("/api/prepare-batch-1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        }),
        fetch("/api/prepare-batch-2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        }),
        fetch("/api/prepare-batch-3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        }),
      ]);

      // Deduct user credits
      await fetch("/api/reduce-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Navigate to the new plan page
      navigate(`/plans/${planId}/plan?isNewPlan=true`);
    } else {
      throw new Error("Failed to generate plan ID");
    }
  } catch (error: any) {
    setError(error.message);
  }

  return error;
}
