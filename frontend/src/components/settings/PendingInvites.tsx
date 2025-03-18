import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getDisplayName } from '@/lib/utils';

interface Invite {
  id: string;
  email: string;
  inviteSent: string;
  inviteExpires: string;
}

interface PendingInvitesProps {
  planId: string;
}

const PendingInvites: React.FC<PendingInvitesProps> = ({ planId }) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
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

  // Fetch invites on component mount
  useEffect(() => {
    const fetchInvites = async () => {
      if (!planId) return;
      
      const userData = getUserData();
      if (!userData) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.post(`http://localhost:5000/api/plan/${planId}/invites`, {
          userData
        });
        
        // The backend returns { success: true, invites: [...] }
        setInvites(response.data.invites || []);
      } catch (error) {
        console.error('Failed to fetch invites:', error);
        toast({
          variant: 'destructive',
          description: "Failed to load pending invites"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvites();
  }, [planId, isSignedIn, user, toast]);

  // Function to revoke an invite
  const revokeEmailInvite = async (id: string, email: string) => {
    setIsPending(true);
    
    const userData = getUserData();
    if (!userData) {
      toast({
        variant: 'destructive',
        description: "Authentication required",
      });
      setIsPending(false);
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/api/plan/${planId}/invite/${id}/revoke`, {
        userData
      });
      
      // Remove the invite from the local state
      setInvites(invites.filter(invite => invite.id !== id));
      
      toast({
        description: `Invite to ${email} has been revoked.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke invite',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  if (loading) return null;
  if (invites.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="mb-2 font-bold text-sm">Pending Invites</div>
      <div className="flex flex-col gap-3 max-w-lg">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="px-5 py-2 border border-solid border-border shadow-sm rounded-md flex gap-5 justify-between items-center"
          >
            <span className="text-sm text-muted-foreground">
              {invite.email}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => revokeEmailInvite(invite.id, invite.email)}
              disabled={isPending}
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvites;