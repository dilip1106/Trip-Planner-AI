import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

type PlanType = {
  contentGenerationState?: Record<string, boolean>;
  setPlanState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  shouldShowAlert: boolean;
  plan: any;
  isLoading: boolean;
};

type PlanContextType = {
  planState: typeof defaultPlanState;
  setPlanState: React.Dispatch<React.SetStateAction<typeof defaultPlanState>>;
  shouldShowAlert: boolean;
  plan: PlanType | null;
  isLoading: boolean;
};

const defaultPlanState = {
  imagination: false,
  abouttheplace: false,
  adventuresactivitiestodo: false,
  topplacestovisit: false,
  itinerary: false,
  localcuisinerecommendations: false,
  packingchecklist: false,
  besttimetovisit: false,
  weather: false,
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlanContext must be used within a PlanContextProvider");
  }
  return context;
};

const PlanContextProvider = ({
  children,
  isPublic,
}: {
  children: React.ReactNode;
  isPublic: boolean;
}) => {
  const [planState, setPlanState] = useState(defaultPlanState);
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowAlert, setShouldShowAlert] = useState(false);
  const {planId} = useParams();

  return (
    <PlanContext.Provider value={{ planState, setPlanState, shouldShowAlert, plan, isLoading }}>
      {children}
    </PlanContext.Provider>
  );
};

export default PlanContextProvider;
