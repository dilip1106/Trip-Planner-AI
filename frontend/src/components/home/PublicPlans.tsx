import PlanCard from "@/components/dashboard/PlanCard";
import { useEffect, useState } from "react";
import axios from 'axios';

interface Plan {
  _id: string;
  url: string | null;
  isSharedPlan: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  nameoftheplace: string;
}

export default function PublicPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

  // Function to fetch plans
  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/plan/public`);
      
      // Axios automatically throws an error for non-2xx responses
      // and automatically parses JSON
      if (response.data.data && Array.isArray(response.data.data)) {
        setPlans(response.data.data);
      } else {
        console.error('Unexpected data format:', response.data);
        throw new Error("Invalid data format received from server");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message);
      } else {
        setError((error as Error).message);
      }
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if(error){
    return error
  }
  if(loading){
    return <p>Loading.....</p>
  }
  return (
    <section
    id="public-plans"
    className="min-h-[100svh]
                   bg-background/90
                   w-full 
                   flex justify-center items-end
                   px-5 md:px-0 py-10 md:py-0"
  >
    <div className="flex flex-col gap-2">
      <h2 className="text-blue-500 text-center text-lg font-bold tracking-wide">
        Our Community's Favorite Trips
      </h2>
      <div
        className="grid grid-cols-1 
                    md:grid-cols-2 lg:grid-cols-3
                    xl:grid-cols-4 4xl:grid-cols-6
                    gap-2 p-10 justify-center"
      >
        {plans?.map((plan) => (
          <PlanCard key={plan._id} plan={plan} isPublic />
        ))}
      </div>
    </div>
  </section>
  );
}
