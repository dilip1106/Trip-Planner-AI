"use client";

import { NoPlans } from "@/components/dashboard/NoPlans";
import PlanCard from "@/components/dashboard/PlanCard";
import DrawerDialog from "@/components/shared/DrawerWithDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ChangeEvent, useState, useEffect } from "react";
import Header from "../plan/Header";

// Define a type for your plan objects
type Plan = {
    _id: string;
    url: string | null;
    isSharedPlan: boolean;
    fromDate?: string | null;
    toDate?: string | null;
    nameoftheplace: string;
};

export default function Dashboard() {
  const [searchPlanText, setSearchPlanText] = useState("");
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPlans, setFilteredPlans] = useState<Plan[] | undefined>();
  
  const finalPlans = filteredPlans ?? plans;

  // Fetch plans from your backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch('/api/plans');
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Handle error appropriately
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
      return plan.nameoftheplace.toLowerCase().includes(value.toLowerCase());
    });

    setFilteredPlans(filteredResults);
  };

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
          {!finalPlans || finalPlans.length === 0 ? (
            <NoPlans isLoading={isLoading} />
          ) : (
            <div
              className="grid grid-cols-1
                       md:grid-cols-2 lg:grid-cols-3
                      2xl:grid-cols-4 4xl:grid-cols-6
                      gap-5 p-10 justify-center"
            >
              {finalPlans?.map((plan) => (
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