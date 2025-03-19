import React, { useMemo } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import Pulse from '@/components/shared/Pulse';
import { Button } from '@/components/ui/button';
import { usePlanContext } from '@/context/PlanContexProvider';
import { controlCenterSections, planSections } from '@/lib/constants';
import { LockIcon } from 'lucide-react';
import { TooltipContainer } from '@/components/shared/Toolip';
interface SidebarProps {
  isMobile?: boolean;
  isPublic: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, isPublic }) => {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the base plan URL by removing any sub-routes
  const basePlanUrl = `/plan/${planId}/plan`;

  const sections = useMemo(() => {
    if (isPublic) return planSections.filter((section) => section.isPublic === isPublic);
    else return planSections;
  }, [planSections, isPublic]);

  const handleSectionClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we're in a control center route, navigate to main plan view first
    if (location.pathname.includes('/expense-tracker') || 
        location.pathname.includes('/settings') || 
        location.pathname.includes('/collaborate')) {
      navigate(basePlanUrl);
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState({}, '', `${basePlanUrl}#${sectionId}`);
        }
      }, 100);
    } else {
      // Normal scroll behavior for main plan view
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState({}, '', `${basePlanUrl}#${sectionId}`);
      }
    }
  };

  return (
    <aside className="space-y-6 sticky top-[5.6rem] h-fit">
      <div className="space-y-2">
        <h2 className="mb-2 md:text-lg text-base font-semibold tracking-tight">Your Plan</h2>
        <div className="flex flex-col">
          {sections.map((section) => (
            <Link
              to={`${basePlanUrl}#${section.id}`}
              key={section.id}
              onClick={handleSectionClick(section.id)}
            >
              <Button
                aria-label={section.name}
                variant="ghost"
                className="w-full 
                          flex justify-start items-start
                          gap-2 whitespace-break-spaces px-2
                          text-foreground dark:text-muted-foreground hover:dark:text-foreground"
              >
                {section.icon}
                <span className="text-left">{section.name}</span>
                {/* {!isPublic && !isMobile && planState && !planState[section.id] && <Pulse />} */}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Control Center</h2>
        <div className="flex flex-col">
          {controlCenterSections.map((link) => {
            if (isPublic)
              return (
                <TooltipContainer
                  key={link.id}
                  text="This section is not available for community shared plans"
                >
                  <div
                    className="flex justify-start items-center gap-2 whitespace-break-spaces p-2
      text-muted-foreground dark:text-muted-foreground/50 text-sm cursor-not-allowed"
                  >
                    {link.icon}
                    <span className="md:text-left">{link.title}</span>
                    <LockIcon className="w-4 h-4" />
                  </div>
                </TooltipContainer>
              );

            return (
              <Link to={isPublic ? `#` : `${basePlanUrl}/${link.id}`} key={link.id}>
                <TooltipContainer text={link.tooltipText}>
                  <Button
                    disabled={isPublic}
                    aria-label={link.id}
                    variant="ghost"
                    className="w-full justify-start items-center gap-2 whitespace-break-spaces px-2
                      text-foreground dark:text-muted-foreground hover:dark:text-foreground"
                  >
                    {link.icon}
                    <span className="md:text-left">{link.title}</span>
                  </Button>
                </TooltipContainer>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
