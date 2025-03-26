import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getDisplayName } from '@/lib/utils';

interface AccessRecord {
  id: string;
  email: string;
  userId?: string;
  clerkUserId: string; // Making this required since we need it for revocation
  firstName?: string;
  lastName?: string;
}

interface AccessRecordsProps {
  planId: string;
}

const AccessRecords: React.FC<AccessRecordsProps> = ({ planId }) => {
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

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

  // Fetch access records on component mount
  useEffect(() => {
    const fetchAccessRecords = async () => {
      if (!planId) return;
      
      const userData = getUserData();
      if (!userData) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.post(`${BASE_URL}/api/plan/${planId}/getCollaborator`, {
          userData
        });
        
        // Access the acceptedInvites array from the response
        const accessRecords = response.data.acceptedInvites || [];
        if (!Array.isArray(accessRecords)) {
          console.error('Expected array of records but got:', accessRecords);
          setRecords([]);
          return;
        }
        setRecords(accessRecords);
      } catch (error) {
        console.error('Failed to fetch access records:', error);
        setRecords([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccessRecords();
  }, [planId, isSignedIn, user]);
  
  // Function to revoke access - now using clerkUserId instead of id
  const revokeAccess = async (clerkUserId: string, email: string) => {
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
      // Now using clerkUserId instead of id
      await axios.post(`${BASE_URL}/api/plan/${planId}/collaborators/${clerkUserId}/revoke`, {
        userData: userData
      });
      
      // Remove the record from the local state
      setRecords(records.filter(record => record.clerkUserId !== clerkUserId));
      
      toast({
        description: `Access of this plan from ${email} has been revoked.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to revoke access',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  if (loading) return null;
  if (records.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="mb-2 font-bold text-sm">
        People having access to this plan
      </div>
      <div className="flex flex-col gap-3 max-w-lg">
        {records.map((record) => (
          <div
            key={record.id}
            className="px-5 py-2 border border-solid border-border shadow-sm rounded-md flex gap-5 justify-between items-center"
          >
            <span className="text-sm text-muted-foreground">
              {getDisplayName(record.firstName, record.lastName, record.email)}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => revokeAccess(record.clerkUserId, record.email)}
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

export default AccessRecords;