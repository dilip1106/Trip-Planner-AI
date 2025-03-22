import React, { useEffect, useState } from 'react';
import { SelectItem } from '@/components/ui/select';
import { UserIcon } from 'lucide-react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

interface User {
  IsCurrentUser: string;
  _id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  name: string;  // Make name required since it's always present in the response
}

interface UserDropdownProps {
  planId?: string;
  userId: string;
  onDefaultUserSelect?: (name: string) => void;  // Changed to expect name instead of userId
  onSelect?: (name: string) => void;  // Changed to expect name instead of userId
}

const UserDropdown: React.FC<UserDropdownProps> = ({ planId, userId, onDefaultUserSelect, onSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { isSignedIn, user } = useUser();

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
    const fetchUsers = async () => {
      try {
        const userData = getUserData();
        if (!userData) return;
        
        const response = await axios.post(`http://localhost:5000/api/plan/${planId}/users`, { userData });
        
        const usersWithCurrentFlag = response.data.map((user: User) => ({
          ...user,
          IsCurrentUser: user._id === userId
        }));
        
        setUsers(usersWithCurrentFlag);
        
        // Set default user (current user) for the form
        if (onDefaultUserSelect && userId) {
          const currentUser = usersWithCurrentFlag.find((u: { _id: string; }) => u._id === userId);
          if (currentUser?.name) {
            onDefaultUserSelect(currentUser.name);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [planId, userId, onDefaultUserSelect]);

  return (
    <>
      {users.map((userObject) => (
        <SelectItem 
          value={userObject.name} // Use name as the value since it's guaranteed to be present
          key={userObject._id}
          onClick={() => onSelect?.(userObject.name)}
        >
          <div className="flex gap-2 items-center">
            <UserIcon className="h-4 w-4" />
            <span>
              {userObject.name} {userObject.IsCurrentUser && "(You)"}
            </span>
          </div>
        </SelectItem>
      ))}
    </>
  );
};

export default UserDropdown;