import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

type DestinationImageProps = {
  imageData?: string;
  destination: string;
  isLoading: boolean;
};

export default function DestinationImage({ imageData, destination, isLoading }: DestinationImageProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-lg" />;
  }

  // If we have a base64 image, display it
  if (imageData) {
    return (
      <div className="w-full overflow-hidden rounded-lg">
        <img 
          src={`data:image/jpeg;base64,${imageData}`}
          alt={`Photo of ${destination}`}
          className="w-full h-64 object-cover"
        />
      </div>
    );
  }

  // Fallback if no image is available
  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">No image available for {destination}</p>
    </div>
  );
}