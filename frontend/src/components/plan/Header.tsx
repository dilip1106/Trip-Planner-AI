import Logo from "@/components/common/Logo"; // Assuming this Logo component exists in the "common" folder
// Import classnames if needed for class concatenation
import {cn} from "@/lib/utils"; // Alternative to 'cn'
// import MenuItems from "./MenuItems";
import  {ThemeDropdown}  from "@/components/ThemeDropdown";
import { ClerkLoading, SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/clerk-react";
import { Loading } from "../shared/Loading";
import DrawerWithDialog from "../shared/DrawerWithDialog";
import FeedbackSheet from "../common/FeedbackSheet";
import PlanComboBox from "./PlanComboBox";
// import DrawerWithDialog from "../shared/DrawerWithDialog";

const Header = () => {

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
          {/* You can add MenuItems, MobileMenu, or other components here */}
          <div className="hidden md:flex items-center justify-center">
            <ul className="flex gap-8 items-center text-sm">
              {/* <MenuItems /> */}
            </ul>
          </div>
          <div className="md:hidden flex gap-6 flex-1">
            {/* <MobileMenu /> */}
          </div>
          <div className="flex gap-4 justify-end items-center flex-1">
            <ClerkLoading>
              <Loading />
            </ClerkLoading>
            <SignedOut>
              <ThemeDropdown />
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <div className="flex justify-center items-center gap-2">
                <PlanComboBox />
                <DrawerWithDialog />
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
