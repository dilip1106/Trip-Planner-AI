"use client";
import { formSchemaType } from "@/components/NewPlanForm";
import { useState } from "react";
import { differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export async function generateEmptyPlanAction(formData: formSchemaType) {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { placeName, activityPreferences, datesOfTravel, companion } = formData;

  // Calculate the number of days between travel dates
  const noOfDays: string = differenceInDays(datesOfTravel.from, datesOfTravel.to).toString();

  try {
    // Call the backend API to create the plan
    const response = await fetch("/api/create-empty-plan", {
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
        isGeneratedUsingAI: false,
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

      // Redirect to the new plan page
      navigate(`/plans/${planId}/plan?isNewPlan=true`);
    } else {
      throw new Error("Failed to generate plan ID");
    }
  } catch (error: any) {
    setError(error.message);
  }

  return error;
}
