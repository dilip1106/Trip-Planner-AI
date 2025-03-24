import Logo from "@/components/common/Logo"; // Assuming this Logo component exists in the "common" folder
// Import classnames if needed for class concatenation
import {cn} from "@/lib/utils"; // Alternative to 'cn'
import MenuItems from "../plan/MenuItems";
import  {ThemeDropdown}  from "@/components/ThemeDropdown";
import { ClerkLoading, SignedOut, SignedIn, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Loading } from "../shared/Loading";
import DrawerWithDialog from "../shared/DrawerWithDialog";
import FeedbackSheet from "../common/FeedbackSheet";
import { useEffect, useState } from "react";
import axios from "axios";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  isPublic?: boolean;
}

const Header = ({ isPublic = false }: HeaderProps) => {
  const [credits, setCredits] = useState<number>(0);
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
    const fetchCredits = async () => {
      try {
        const userData = getUserData();
        if (!userData) return;

        const response = await axios.post(
          'http://localhost:5000/api/auth/credits',
          { userData }
        );

        if (response.data.success) {
          setCredits(response.data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    if (isSignedIn) {
      fetchCredits();
    }
  }, [isSignedIn, user]);

  return (
    <header
      className={cn(
        "w-full border-b bottom-2 border-border/40 z-50 sticky top-0",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <nav className="lg:px-20 px-5 py-3 mx-auto">
        <div className="flex justify-evenly w-full">
          <Logo />
          <div className="hidden md:flex items-center justify-center">
            <ul className="flex gap-8 items-center text-sm">
              <MenuItems isPublic={isPublic} />
            </ul>
          </div>
          <div className="md:hidden flex gap-6 flex-1">
            <MobileMenu isPublic={false} />
          </div>
          <div className="flex gap-4 justify-end items-center flex-1">
            <ClerkLoading>
              <Loading />
            </ClerkLoading>
            <SignedOut>
              <ThemeDropdown />
              <SignInButton mode="modal"/>
            </SignedOut>
            <SignedIn>
              <div className="flex justify-center items-center gap-2">
                {/* <PlanComboBox /> */}
                <DrawerWithDialog shouldOpenForCreatePlan={false} credits={credits} />
                <FeedbackSheet />
                <ThemeDropdown />
                <UserButton  />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
