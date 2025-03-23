import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate } from "date-fns";
import { useAuth, useUser } from "@clerk/clerk-react";

export const getUserData = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
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
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayName = (
  firstName: string | undefined,
  lastName: string | undefined,
  email: string
) => {
  if (!firstName) return email;
  return firstName + (lastName ? ` ${lastName}` : "") + ` (${email})`;
};

export const getFormattedDateRange = (fromDate: Date, toDate: Date, formatStr: string = "PPP") => {
  return `${formatDate(fromDate, formatStr)} - ${formatDate(toDate, formatStr)}`
}
