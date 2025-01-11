// src/providers/BackendClientProvider.tsx
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";

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
      {children}
    </ClerkProvider>
  );
}
