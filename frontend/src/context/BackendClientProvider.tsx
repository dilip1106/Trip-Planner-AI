// src/providers/BackendClientProvider.tsx
import { ReactNode, useEffect } from "react";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import axios from "axios";


const NODE_URI=import.meta.env.VITE_NODE_ENV;
const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";


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
      clerkId: user.id,  // Changed from clerkUserId to match your schema
      email: user.primaryEmailAddress?.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(), // Combine first and last name
      image: user.imageUrl || "", // Added image field
      // Plans and collaboratingPlans are handled on the server
    };
    
    // Send data to your backend API using axios
    const response = await axios.post(
      `${BASE_URL}/api/auth/save-user`, 
      userData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
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