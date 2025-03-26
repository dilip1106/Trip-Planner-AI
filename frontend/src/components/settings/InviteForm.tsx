import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { ShieldX } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loading } from '@/components/shared/Loading';

const formSchema = z.object({
  email: z.string().email('Invalid email address').min(2).max(50),
});

type FormValues = z.infer<typeof formSchema>;

interface InviteFormProps {
  planId: string;
}

const InviteForm: React.FC<InviteFormProps> = ({ planId }) => {
  const [sendingInvite, setSendingInvite] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
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

  const onSubmit = async (values: FormValues) => {
    setSendingInvite(true);
    
    const userData = getUserData();
    if (!userData) {
      toast({
        variant: 'destructive',
        description: "Authentication required",
      });
      setSendingInvite(false);
      return;
    }
    
    // Get the current user's email from Clerk
    const userEmail = userData.email;

    if (userEmail && userEmail === values.email) {
      toast({
        variant: 'destructive',
        description: (
          <div className="font-sans flex justify-start items-center gap-1">
            <ShieldX className="h-5 w-5 text-white" />
            You cannot invite yourself to join this Plan
          </div>
        ),
      });
      form.reset();
      setSendingInvite(false);
      return;
    }

    if (!planId || planId.length === 0) return;

    try {
      // Send the invitation request to your backend with user data in body
      await axios.post(`${BASE_URL}/api/plan/${planId}/collaborators`, {
        email: values.email,
        userData: userData
      });

      toast({
        description: (
          <div className="font-sans flex justify-start items-center gap-1">
            Email Invite sent successfully!
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send invite',
        variant: 'destructive',
      });
    }
    
    form.reset();
    setSendingInvite(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5 max-w-xl">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Email</FormLabel>
              <FormControl>
                <Input
                  disabled={sendingInvite}
                  type="email"
                  placeholder="your-co-worker@example.com"
                  {...field}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={sendingInvite}
          className="text-white bg-blue-500 hover:bg-blue-700"
        >
          {sendingInvite ? (
            <div className="flex justify-center items-center gap-2">
              <Loading className="w-4 h-4" /> Sending Invite...
            </div>
          ) : (
            "Invite"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default InviteForm;