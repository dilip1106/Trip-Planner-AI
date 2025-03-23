import Header from "@/components/plan/Header";
import Sidebar from "@/components/plan/Sidebar";
import CurrencySelector from "@/components/settings/CurrencySelector";
import DangerZone from "@/components/settings/DangerZone";
import { useParams } from "react-router-dom";
// import DisplayName from "@/components/settings/DisplayName";

export default function PlanSettings() {
  const {planId} = useParams();
  return (

    <>
    <Header/>
      <div className="w-full lg:px-20 px-5 py-6 min-h-[calc(100svh-6.5rem)] bg-background">
        <div className="md:grid md:grid-cols-5 lg:gap-2 md:gap-5 gap-3">
          <div
            className="hidden md:flex md:col-span-1 
             lg:border-r lg:border-muted-foreground/30 
             relative"
          >
            
            
            <Sidebar  isPublic={false} />
          </div>
          <div className="md:col-span-4 pl-4 lg:pl-8"><section className="flex flex-col gap-5">
      <CurrencySelector planId={planId} />
      {/* <DisplayName /> */}
      <DangerZone planId={planId} />
    </section></div>
        </div>
      </div>
    </>
    
  );
}
