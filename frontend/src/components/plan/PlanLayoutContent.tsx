import React from "react";
import PlanContextProvider from "@/context/PlanContexProvider";
import Sidebar from "@/components/plan/Sidebar";
import Header from "./Header";

const PlanLayoutContent = ({
  children,
  isPublic,
}: {
  children: React.ReactNode;
  isPublic: boolean;
}) => {
  return (
    <PlanContextProvider isPublic={isPublic}>
      <Header/>
      <div className="w-full lg:px-20 px-5 py-6 min-h-[calc(100svh-6.5rem)] bg-background">
        <div className="md:grid md:grid-cols-5 lg:gap-2 md:gap-5 gap-3">
          <div
            className="hidden md:flex md:col-span-1 
             lg:border-r lg:border-muted-foreground/30 
             relative"
          >
            
            
            <Sidebar  isPublic={true} />
          </div>
          <div className="md:col-span-4 pl-4 lg:pl-8">{children}</div>
        </div>
      </div>
    </PlanContextProvider>
  );
};

export default PlanLayoutContent;
