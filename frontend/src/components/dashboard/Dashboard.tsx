"use client";

import { NoPlans } from "@/components/dashboard/NoPlans";
import PlanCard from "@/components/dashboard/PlanCard";
import DrawerDialog from "@/components/shared/DrawerWithDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ChangeEvent, useState, useEffect } from "react";
import Header from "../plan/Header";
import axios, { AxiosError } from "axios";

import { useAuth, useUser } from "@clerk/clerk-react";

// Define types for your plan objects
type Plan = {
  _id: string;
  destination: string;
  fromDate?: string | null;
  toDate?: string | null;
  nameoftheplace?: string;
  isPublic?: boolean;
  isSharedPlan?: boolean;
};

type ApiResponse = {
  success: boolean;
  data: {
    owned: Plan[];
    collaborated: Plan[];
  };
};

export default function Dashboard() {
  const [searchPlanText, setSearchPlanText] = useState("");
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPlans, setFilteredPlans] = useState<Plan[] | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Function to get user data for the backend
  const getUserData = () => {
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
  
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          setIsLoading(false);
          return;
        }
        
        const response = await axios.post<ApiResponse>(
          `http://localhost:5000/api/plan/`, 
          { userData }
        );
        
        console.log("API response:", response.data);
        
        // Extract and combine owned and collaborated plans
        const ownedPlans = response.data.data.owned.map(plan => ({
          ...plan,
          nameoftheplace: plan.destination // Make sure nameoftheplace is set for search
        }));
        
        const collaboratedPlans = response.data.data.collaborated.map(plan => ({
          ...plan,
          nameoftheplace: plan.destination,
          isSharedPlan: true
        }));
        
        // Combine all plans
        const allPlans = [...ownedPlans, ...collaboratedPlans];
        setPlans(allPlans);
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        const errorMessage = 
          (err instanceof AxiosError && err.response?.data?.error) ||
          (err instanceof Error ? err.message : 'An error occurred');
        setError(errorMessage);
        setPlans(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, [isSignedIn, user]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchPlanText(value);
    
    if (!plans || !plans.length) {
      return;
    }

    if (!value) {
      setFilteredPlans(undefined);
      return;
    }

    const filteredResults = plans.filter((plan) => {
      return plan.nameoftheplace?.toLowerCase().includes(value.toLowerCase()) ||
             plan.destination?.toLowerCase().includes(value.toLowerCase());
    });

    setFilteredPlans(filteredResults);
  };

  // Get final plans to display (filtered or all)
  const finalPlans = filteredPlans !== undefined ? filteredPlans : plans;

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center bg-blue-50/40">
        <section
          className="bg-stone-200 w-full h-full
                  flex-1 flex flex-col dark:bg-background"
        >
          <div
            className="flex justify-between gap-5 bg-stone-50 items-center
                       lg:px-20 px-7 py-4 border-b dark:bg-background sticky top-0"
          >
            <div className="relative ml-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                id="searchPlan"
                name="searchPlan"
                onChange={handleSearch}
                value={searchPlanText}
                placeholder="Search Travel Plan..."
                type="search"
                className="w-full cursor-pointer rounded-lg bg-background pl-8 transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                disabled={!plans || !plans.length}
              />
            </div>

            <DrawerDialog shouldOpenForCreatePlan={true} />
          </div>
          <div className="flex h-full w-full px-4 lg:px-20 flex-1">
            <div
              className="mt-5 mx-auto bg-background dark:border-2 dark:border-border/50 rounded-sm flex-1"
              style={{ flex: "1 1 auto" }}
            >
              {!finalPlans || !Array.isArray(finalPlans) || finalPlans.length === 0 ? (
                <NoPlans isLoading={isLoading} />
              ) : (
                <div
                  className="grid grid-cols-1
                         md:grid-cols-2 lg:grid-cols-3
                        2xl:grid-cols-4 4xl:grid-cols-6
                        gap-5 p-10 justify-center"
                >
                  {finalPlans.map((plan) => (
                    <PlanCard key={plan._id} plan={plan} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}