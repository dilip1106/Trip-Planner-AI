import React from 'react';
import { useParams } from 'react-router-dom';
import PendingInvites from '@/components/settings/PendingInvites';
import AccessRecords from '@/components/settings/AccessRecords';
import InviteForm from '@/components/settings/InviteForm';
import Header from '@/components/plan/Header';
import Sidebar from '@/components/plan/Sidebar';

const Collaborator: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();

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


            <Sidebar isPublic={false} />
          </div>
          <div className="md:col-span-4 pl-4 lg:pl-8"><div className="bg-background shadow-sm rounded-lg p-4 border-2 border-border">
            <div className="border-b-2 border-b-border pb-2 mb-2 font-bold">Collaborators</div>
            <p className="text-sm text-muted-foreground">
              To invite people to your travel plan, send them an email invite using below
            </p>
            <InviteForm planId={planId || ''} />
            <PendingInvites planId={planId || ''} />
            <AccessRecords planId={planId || ''} />
          </div></div>
        </div>
      </div>
    </>
  );
};

export default Collaborator;