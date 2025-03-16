import { Link } from "react-router-dom";
import { CalendarDaysIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipContainer } from "@/components/shared/Toolip";
import { getFormattedDateRange } from "@/lib/utils";

interface Plan {
  _id: string;
  url?: string | null;
  isSharedPlan?: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  nameoftheplace?: string;
  destination?: string;
  destinationImage?: string;
}

interface PlanCardProps {
  plan: Plan;
  isPublic?: boolean;
}

const PlanCard = ({ plan, isPublic = false }: PlanCardProps) => {
  const planLink = isPublic
    ? `/plan/${plan._id}/community-plan`
    : `/plan/${plan._id}/plan`;

  const dateRange =
    plan.fromDate && plan.toDate
      ? getFormattedDateRange(
          new Date(plan.fromDate),
          new Date(plan.toDate),
          "PP"
        )
      : "Select Dates from plan Page";

  // Use destination if nameoftheplace is not available
  const placeName = plan.nameoftheplace || plan.destination || "Unknown Location";

  return (
    <Link
      role="article"
      to={planLink}
      className="flex justify-center items-center"
    >
      <Card className="w-80 md:w-96 h-[250px] rounded-lg cursor-pointer overflow-hidden group/card hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0 h-full">
          <div className="relative w-full h-full">
            <img
              role="figure"
              alt={`Travel destination: ${placeName}`}
              src={`data:image/jpeg;base64,${plan.destinationImage}`}
              className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-in-out"
            />
            {plan.isSharedPlan && (
              <TooltipContainer text="This plan has been shared with you">
                <div className="absolute right-3 top-3 bg-white rounded-lg p-2 text-sm shadow-lg text-gray-600">
                  Shared
                </div>
              </TooltipContainer>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent py-6 px-4 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{placeName}</h3>
                  {!isPublic && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>{dateRange}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PlanCard;