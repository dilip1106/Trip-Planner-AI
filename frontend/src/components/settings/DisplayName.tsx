"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is mandatory!" }),
  lastName: z.optional(z.string()),
});

const DisplayName = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user, isLoaded, isSignedIn } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSending(true);
    const { firstName, lastName } = values;

    try {
      const userData = getUserData();
      
      if (!userData) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      // Update Clerk user
    //   if (user) {
    //     try {
    //       // Using the correct syntax for updating user
    //       await user.update({
    //         firstName: firstName.trim() || undefined,
    //         lastName: lastName?.trim() || undefined,
    //       });
    //     } catch (clerkError) {
    //       console.error('Clerk update error:', clerkError);
    //       toast({
    //         title: "Error",
    //         description: "Failed to update display name in Clerk",
    //         variant: "destructive",
    //       });
    //       setIsSending(false);
    //       return;
    //     }
    //   }

      // Only update backend if Clerk update was successful
      await axios.put("http://localhost:5000/api/auth/user/update", {
        userData: {
          ...userData,
          name: `${firstName.trim()} ${lastName?.trim() || ''}`.trim(),
        },
        firstName: firstName.trim(),
        lastName: lastName?.trim() || "",
      });

      toast({
        description: "Display Name has been updated!",
      });
    } catch (error) {
      let errorMessage = 'Something went wrong';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    form.setValue("firstName", user.firstName || "");
    form.setValue("lastName", user.lastName || "");
  }, [isLoaded, isSignedIn, user]);

  const shouldGetDisabled = isSending || !isLoaded || !isSignedIn;

  return (
    <article className="bg-background shadow-sm rounded-lg p-4 border-2 border-border">
      <h2 className="border-b-2 border-b-border pb-2 mb-2 font-bold">
        Display Name
      </h2>

      <h3 className="text-neutral-500 dark:text-neutral-400 mb-4 flex text-sm sm:text-base">
        Set your own display name
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. John"
                    {...field}
                    className="max-w-md"
                    disabled={shouldGetDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Doe"
                    {...field}
                    className="max-w-md"
                    disabled={shouldGetDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={shouldGetDisabled}
            className={cn(
              "text-white hover:text-white bg-blue-500 hover:bg-blue-700"
            )}
          >
            {isSending ? (
              <div className="flex justify-center items-center gap-2">
                <Loading className="w-4 h-4" /> Saving Display Name...
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </Form>
    </article>
  );
};

export default DisplayName;