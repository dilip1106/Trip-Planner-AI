import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/plan/Sidebar";
import { ArrowLeft } from "lucide-react";
import MenuItems from "../plan/MenuItems";

const MobileMenu = ({ isPublic }: { isPublic: boolean }) => {
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const { planId } = useParams(); // Access planId from React Router's useParams
  const navigate = useNavigate(); // To navigate programmatically
  const handleClickOutside = (event: MouseEvent) => {
    if (asideRef.current && !asideRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Button
        aria-label="open side menu"
        onClick={() => setOpen(!open)}
        variant="link"
        className="text-xl"
      >
        <AiOutlineMenu />
      </Button>
      <aside
        ref={asideRef}
        className={cn(
          "fixed top-0 left-0 z-[100] bg-background w-[50%] border-r-2 border-neutral-200 h-full ease-in-out duration-700",
          open ? "left-0" : "left-[-100%]",
          "flex flex-col gap-2 min-h-[100svh]"
        )}
      >
        <div className="flex justify-between p-2">
          <Link to="/">
            <div
              className="flex flex-col leading-5
                             font-bold text-md p-1"
            >
              <span>Travel</span>
              <span>
                Planner
                <span className="text-blue-500 ml-0.5">AI</span>
              </span>
            </div>
          </Link>
          <Button
            aria-label="close menu"
            onClick={() => setOpen(false)}
            variant="link"
            className="text-xl"
          >
            <AiOutlineClose />
          </Button>
        </div>
        <ul
          className="w-full flex flex-col gap-7 justify-center items-start
                      p-5  text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <li className="cursor-pointer hover:underline">
            <Link to="/dashboard" className="flex gap-1 justify-end items-center group">
              <ArrowLeft className="w-4 h-4 group-hover:scale-125 transition-all duration-100 ease-linear" />
              <span>Go back to Dashboard</span>
            </Link>
          </li>
        </ul>
        <div
          className="px-5"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
            <MenuItems isPublic={true} />
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;
