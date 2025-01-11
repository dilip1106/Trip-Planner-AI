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

// Replace this function with your actual API call
const fetchPlans = async () => {
  const response = await fetch("/api/plans"); // Adjust URL accordingly
  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }
  return response.json();
};

export default function PlanComboBox() {
  const [open, setOpen] = React.useState(false);
  const [plans, setPlans] = useState<any[]>([]); // Replace `any` with your actual plan type
  const [loading, setLoading] = useState<boolean>(true);

  const location = useLocation(); // React Router equivalent of usePathname
  const navigate = useNavigate(); // React Router equivalent of useRouter
  const { planId } = useParams<{ planId: string }>(); // React Router equivalent of useParams

  useEffect(() => {
    const getPlans = async () => {
      try {
        const data = await fetchPlans();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    getPlans();
  }, []);

  const getDisplayTitle = () => {
    const label =
      plans?.find((plan) => plan._id === planId)?.nameoftheplace ?? "Select Plan";
    return label;
  };

  if (loading) {
    return (
      <div className="w-[300px] h-8 rounded-md bg-stone-200 animate-pulse" />
    );
  }

  // if (plans.length === 0) return null;

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
                {plans.map((plan) => (
                  <CommandItem
                    key={plan._id}
                    value={plan._id}
                    onSelect={(currentValue) => {
                      setOpen(false);
                      let updatedUrl = location.pathname.replace(
                        /\/plans\/[^\/]+/,
                        "/plans/" + plan._id
                      );
                      if (
                        location.pathname.includes("join") ||
                        location.pathname.includes("community-plan")
                      ) {
                        updatedUrl = `/plans/${plan._id}/plan`;
                      }
                      navigate(updatedUrl); // React Router equivalent of router.push
                    }}
                    className="cursor-pointer"
                  >
                    {plan.nameoftheplace}
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
