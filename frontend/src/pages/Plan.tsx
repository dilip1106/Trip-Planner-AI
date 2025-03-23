import CommunityPlan from "@/components/plan/CommunityPlan";
import Header from "@/components/plan/Header";
import MobileMenu from "@/components/plan/MobileMenu";
import Sidebar from "@/components/plan/Sidebar";

export default  function PlanPage() {
  // return <CommunityPlan  />;
  return <>
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
          <div className="md:col-span-4 pl-4 lg:pl-8"><CommunityPlan  /></div>
        </div>
      </div>
  </>
}
