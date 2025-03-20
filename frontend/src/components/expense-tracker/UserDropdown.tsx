import React, { useEffect, useState } from 'react';
import { SelectItem } from '@/components/ui/select';
import { UserIcon } from 'lucide-react';
import axios from 'axios';
// import { useUser } from '@clerk/clerk-react';

interface User {
  _id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  IsCurrentUser?: boolean;
}

interface UserDropdownProps {
  planId?: string;
  userId: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ planId, userId }) => {
  const [users, setUsers] = useState<User[]>([]);
//   const { user: currentUser } = useUser();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/plans/${planId}/users`);
        
        // Mark current user
        const usersWithCurrentFlag = response.data.map((user: User) => ({
          ...user,
          IsCurrentUser: user.userId === userId
        }));
        
        setUsers(usersWithCurrentFlag);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [planId, userId]);

  const getDisplayName = (userObject: User) => {
    if (!userObject.firstName && !userObject.lastName) return userObject.email;
    if (userObject.firstName && userObject.firstName.length > 0)
      return (
        userObject.firstName +
        (userObject.lastName ? ` ${userObject.lastName}` : "")
      );
  };

  return (
    <>
      {users.map((userObject) => (
        <SelectItem value={userObject.userId} key={userObject.userId}>
          <div className="flex gap-2 items-center">
            <UserIcon className="h-4 w-4" />
            <span>
              {getDisplayName(userObject)} {userObject.IsCurrentUser && "(You)"}
            </span>
          </div>
        </SelectItem>
      ))}
    </>
  );
};

export default UserDropdown;