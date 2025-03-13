import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const GeneratePlanButton: React.FC = () => {
  const { openSignIn } = useClerk();
  const { isLoaded } = useUser(); // Use isLoaded from useUser to check if Clerk is ready
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isSignedIn) {
        navigate("/dashboard"); // Redirect to the dashboard
      } else {
        openSignIn(); // Open the sign-in popup if not signed in
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner until Clerk is loaded
  if (!isLoaded) {
    return (
      <Button
        aria-label="generate plan"
        variant="default"
        className="bg-blue-500 text-white hover:bg-blue-700 text-sm font-semibold rounded-3xl  flex justify-center items-center"
      >
        <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
      </Button>
    );
  }

  return (
    <Button
      aria-label="generate plan"
      onClick={handleClick}
      variant="default"
      className="bg-blue-500 text-white hover:bg-blue-700 text-sm font-semibold rounded-3xl  flex justify-center items-center"
    >
      {isLoading ? (
        <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
      ) : (
        <>
          <SignedIn>Go to Dashboard</SignedIn>
          <SignedOut>Try Now - 1 Free Credits</SignedOut>
        </>
      )}
    </Button>
  );
};

export default GeneratePlanButton;
