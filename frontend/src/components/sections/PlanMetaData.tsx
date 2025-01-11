import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangeSelector from "@/components/common/DateRangeSelector";
import { Settings2 } from "lucide-react";
import { ACTIVITY_PREFERENCES, COMPANION_PREFERENCES } from "@/lib/constants";

type PlanMetaDataProps = {
  allowEdit: boolean;
  fromDate: number | undefined;
  toDate: number | undefined;
  planId: string;
  companion: string | undefined;
  activityPreferences: string[];
};

const PlanMetaData = ({
  allowEdit,
  fromDate,
  toDate,
  planId,
  companion,
  activityPreferences,
}: PlanMetaDataProps) => {
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const onChangeTravelDates = (e: DateRange | undefined) => {
    if (!e) return;
    setSelectedDates(e);

    if (e.from && e.to) {
      // Mocking backend logic
      console.log("Updating travel dates...", {
        planId,
        fromDate: e.from.getTime(),
        toDate: e.to.getTime(),
      });
      setToastMessage("Travel Dates updated Successfully");
      setTimeout(() => setToastMessage(null), 3000); // Clear toast after 3 seconds
    }
  };

  useEffect(() => {
    if (!fromDate || !toDate) return;
    setSelectedDates({
      from: new Date(fromDate),
      to: new Date(toDate),
    });
  }, [fromDate, toDate]);

  if (!allowEdit) return null;

  const shouldShowPlanMetaData = companion || activityPreferences.length > 0;

  const preferences = activityPreferences.map(
    (act) => ACTIVITY_PREFERENCES.find((a) => a.id === act)!
  );

  const selectedCompanion = COMPANION_PREFERENCES.find(
    (c) => c.id === companion
  );

  return (
    <div className="lg:flex hidden flex-col items-end">
      <DateRangeSelector
        value={selectedDates}
        onChange={onChangeTravelDates}
        forGeneratePlan={false}
      />

      {toastMessage && (
        <div className="bg-green-500 text-white p-2 rounded-md">{toastMessage}</div>
      )}

      {shouldShowPlanMetaData && (
        <div
          className="bg-foreground/50 tracking-wide text-sm p-2 rounded-xl 
                flex flex-col gap-4 mt-2 transition-all duration-500 ease-in-out group w-8 hover:w-full"
        >
          <div className="flex justify-end group-hover:hidden">
            <Settings2 className="w-4 h-4 text-background" />
          </div>
          {selectedCompanion && (
            <div
              className="group-hover:opacity-100 opacity-0 
                    hidden flex-col gap-1
                    transition-all duration-700 ease-in-out delay-1000 group-hover:flex"
            >
              <div className="font-bold text-background pb-1">
                Travelling Mode
              </div>
              <div
                className="flex gap-1 justify-center items-center bg-background select-none
                     text-foreground font-semibold rounded-full py-1 px-2 w-fit"
              >
                <selectedCompanion.icon className="h-4 w-4" />
                <span>{selectedCompanion.displayName}</span>
              </div>
            </div>
          )}
          {preferences.length > 0 && (
            <div
              className="group-hover:opacity-100 opacity-0 
                    hidden flex-col gap-1
                    transition-all duration-700 ease-in-out delay-1000 group-hover:flex"
            >
              <div className="font-bold text-background pb-1">
                Activity Preferences
              </div>
              <div className="grid justify-start items-center grid-cols-2 gap-2">
                {preferences.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-1 bg-background select-none
                     text-foreground font-semibold rounded-full p-1 justify-center items-center"
                  >
                    <activity.icon className="h-4 w-4" />
                    <span>{activity.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanMetaData;
