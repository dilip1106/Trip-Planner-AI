"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // Import from react-router-dom
import { useAuth, useUser } from "@clerk/clerk-react";
import axios, { AxiosError } from "axios";

type Plan = {
  _id: string;
  destination: string;
};

type ApiResponse = {
  success: boolean;
  data: {
    owned: Plan[];
    collaborated: Plan[];
  };
};

export default function PlanComboBox() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // React Router equivalent of usePathname
  const navigate = useNavigate(); // React Router equivalent of useRouter
  const { planId } = useParams<{ planId: string }>(); // React Router equivalent of useParams

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
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          setIsLoading(false);
          return;
        }
        
        const response = await axios.post<ApiResponse>(
          'http://localhost:5000/api/plan/plan-name-only', 
          { userData }
        );
        
        // Combine owned and collaborated plans
        const allPlans = [
          ...response.data.data.owned,
          ...response.data.data.collaborated
        ];
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
    
    fetchUserData();
  }, [isSignedIn, user]);

  const getDisplayTitle = () => {
    const label = plans?.find((plan) => plan._id === planId)?.destination ?? "Select Plan";
    return label;
  };

  const handlePlanSelect = (selectedPlanId: string) => {
    setOpen(false);
    
    // Determine the base route
    let newPath = '';
    
    // Check if we're in a specific feature route (expense-tracker, collaborate, settings)
    if (location.pathname.includes('/expense-tracker')) {
      newPath = `/plan/${selectedPlanId}/plan/expense-tracker`;
    } else if (location.pathname.includes('/collaborate')) {
      newPath = `/plan/${selectedPlanId}/plan/collaborate`;
    } else if (location.pathname.includes('/settings')) {
      newPath = `/plan/${selectedPlanId}/plan/settings`;
    } else {
      // Default to main plan view
      newPath = `/plan/${selectedPlanId}/plan`;
    }

    navigate(newPath);
  };

  if(error) {
    return error
  }
  if (isLoading) {
    return (
      <div className="w-[300px] h-8 rounded-md bg-stone-200 animate-pulse" />
    );
  }

  return (
    <div className="sm:flex hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
            size="sm"
          >
            <span className="max-w-[90%] text-ellipsis overflow-hidden">
              {getDisplayTitle()}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Select Travel Plan..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {plans?.map((plan) => (
                  <CommandItem
                    key={plan._id}
                    value={plan._id}
                    onSelect={() => handlePlanSelect(plan._id)}
                    className="cursor-pointer"
                  >
                    {plan.destination}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
