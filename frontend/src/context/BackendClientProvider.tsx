// src/providers/BackendClientProvider.tsx
import { ReactNode, useEffect } from "react";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import axios from "axios";

// Inner component to handle user data persistence
function UserDataPersistence() {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Execute only when a user is newly signed in and data is loaded
    if (isLoaded && isSignedIn && user) {
      saveUserToDatabase(user);
    }
    // console.log(user)
  }, [isSignedIn, isLoaded, user]);

  return null; // This component doesn't render anything
}

// Function to save user data to your backend using axios
async function saveUserToDatabase(user: any) {
  try {
    const userData = {
      clerkUserId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username || user.firstName, // Fallback if username is not available
      // imageUrl: user.imageUrl,
      // Add any other user fields you need
    };

    // Send data to your backend API using axios
    const response = await axios.post(
      `http://localhost:5000/api/auth/save-user`, 
      userData
    );
    
    console.log('User data saved successfully:', response.data);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export default function BackendClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(222.2, 47.4%, 11.2%)",
        },
      }}
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
    >
      <UserDataPersistence />
      {children}
    </ClerkProvider>
  );
}