// src/components/CurrencySelector.tsx
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useUser } from "@clerk/clerk-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Import currencies from a JSON file
import currencies from "@/lib/currencies.json";

const formSchema = z.object({
  currency: z
    .string()
    .min(1, { message: "You will have to pick a preferred currency." }),
});

interface CurrencySelectorProps {
  planId?: string;
}

const CurrencySelector = ({ planId }: CurrencySelectorProps) => {
  const [isSending, setIsSending] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: preferredCurrency || "",
    },
  });

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

  // Fetch preferred currency on component mount
  useEffect(() => {
    const fetchPreferredCurrency = async () => {
      try {
        const userData = getUserData();
        
        if (!userData) {
          return;
        }
        
        const response = await axios.post(
          `${BASE_URL}/api/plan/${planId}/currency`,
          { userData }
        );

        const currency = response.data.preferredCurrency;
        setPreferredCurrency(currency);
        form.setValue("currency", currency);
      } catch (err) {
        console.error("Error fetching preferred currency:", err);
      }
    };

    fetchPreferredCurrency();
  }, [planId, isSignedIn, user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSending(true);

    if (!planId || planId.length === 0) return;
    
    try {
      const userData = getUserData();
      
      if (!userData) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }
      
      await axios.post(
        `${BASE_URL}/api/plan/${planId}/currency/update`,
        {
          userData,
          currencyCode: values.currency,
        }
      );
      
      toast({
        description: (
          <div className="font-sans flex justify-start items-center gap-1">
            Your preferences have been saved!
          </div>
        ),
      });
      
      setPreferredCurrency(values.currency);
    } catch (error) {
      const errorMessage = 
        (error instanceof AxiosError && error.response?.data?.error) ||
        (error instanceof Error ? error.message : 'Something went wrong!');
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsSending(false);
  };

  return (
    <article className="bg-background shadow-sm rounded-lg p-4 border-2 border-border">
      <h2 className="border-b-2 border-b-border pb-2 mb-2 font-bold font-md">
        Preferred Currency
      </h2>

      <h3 className="text-neutral-500 dark:text-neutral-400 mb-4 flex text-sm sm:text-base">
        Select your preferred currency for this plan which can be used in
        expenses section.
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex gap-3 justify-start items-center"
        >
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    disabled={isSending || preferredCurrency === undefined}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={preferredCurrency}
                  >
                    <SelectTrigger className="max-w-md">
                      <SelectValue
                        placeholder={
                          preferredCurrency === undefined
                            ? "Loading preferred Currency"
                            : "Select a Currency"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Currency</SelectLabel>
                        {currencies.map((currency) => (
                          <SelectItem value={currency.cc} key={currency.cc}>
                            {currency.cc} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSending || preferredCurrency === undefined}
            className={cn(
              "text-white hover:text-white bg-blue-500 hover:bg-blue-700"
            )}
          >
            {isSending ? (
              <div className="flex justify-center items-center gap-2">
                <Loading className="w-4 h-4" /> Saving Preferences...
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </Form>
      <p className="font-sans text-sm text-muted-foreground pt-3">
        Note: System defaults to INR if no currency is preferred.
      </p>
    </article>
  );
};

export default CurrencySelector;