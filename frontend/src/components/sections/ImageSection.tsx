import SectionWrapper from "@/components/sections/SectionWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationImage from "./DestinationImage";

type ImageSectionProps = {
  userPrompt: string | undefined;
  companion: string | undefined;
  activityPreferences: string[] | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;
  placeName: string | undefined;
  // imageUrl: string | undefined;
  destinationImage: string | undefined; // New prop for base64 image
  isLoading: boolean;
  allowEdit: boolean;
  planId: string;
};

export default function ImageSection({
  userPrompt,
  companion,
  activityPreferences,
  fromDate,
  toDate,
  placeName,
  // imageUrl,
  destinationImage,
  isLoading,
  allowEdit,
  planId,
}: ImageSectionProps) {
  return (
    <SectionWrapper id="imagination">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-10 w-1/2" /> : placeName}
          </h1>
          <p className="text-gray-500">
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              `${fromDate && toDate ? `${fromDate} - ${toDate}` : ""} ${
                companion ? `with ${companion}` : ""
              }`
            )}
          </p>
        </div>
        
        {/* Use the new DestinationImage component */}
        <DestinationImage 
          imageData={destinationImage} 
          destination={placeName || "destination"} 
          isLoading={isLoading} 
        />
        
        {activityPreferences && activityPreferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activityPreferences.map((preference, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {preference}
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}