import React from 'react';
import { useParams } from 'react-router-dom';
import PendingInvites from '@/components/settings/PendingInvites';
import AccessRecords from '@/components/settings/AccessRecords';
import InviteForm from '@/components/settings/InviteForm';

const Collaborator: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  
  return (
    <div className="bg-background shadow-sm rounded-lg p-4 border-2 border-border">
      <div className="border-b-2 border-b-border pb-2 mb-2 font-bold">Collaborators</div>
      <p className="text-sm text-muted-foreground">
        To invite people to your travel plan, send them an email invite using below
      </p>
      <InviteForm planId={planId || ''} />
      <PendingInvites planId={planId || ''} />
      <AccessRecords planId={planId || ''} />
    </div>
  );
};

export default Collaborator;