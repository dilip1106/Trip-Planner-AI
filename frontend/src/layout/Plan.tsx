import PlanLayoutContent from "@/components/plan/PlanLayoutContent";

import { ReactNode } from 'react';
import Header from '@/components/plan/Header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <Header  /> */}
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-blue-50/40 dark:bg-background">
        <PlanLayoutContent isPublic={true}>{children}</PlanLayoutContent>
      </main>
    </>
  );
}
