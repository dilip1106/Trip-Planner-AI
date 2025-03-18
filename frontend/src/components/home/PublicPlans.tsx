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

  // Function to fetch plans
  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/plan/public");
      
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

  // const mockPlans: Plan[] = [
  //   {
  //     _id: "12345",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2Fa400ae1f-2994-4431-8a18-ce7170a907b7&w=1920&q=75",
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Paris, France",
  //   },
  //   {
  //     _id: "12346",
  //     url:"https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2Fbb0d222b-ac06-4c30-a69e-4fb0f4d9031a&w=640&q=75", 
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "New York City, USA",
  //   },
  //   {
  //     _id: "12347",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F563c4c47-4fde-4abd-8c94-0709e9198041&w=640&q=75",
  //     isSharedPlan: true,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Tokyo, Japan",
  //   },
  //   {
  //     _id: "12345",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Paris, France",
  //   },
  //   {
  //     _id: "12346",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "New York City, USA",
  //   },
  //   {
  //     _id: "12347",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: true,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Tokyo, Japan",
  //   },
  //   {
  //     _id: "12345",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Paris, France",
  //   },
  //   {
  //     _id: "12346",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: false,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "New York City, USA",
  //   },
  //   {
  //     _id: "12347",
  //     url: "https://www.travelplannerai.online/_next/image?url=https%3A%2F%2Fkindred-rhinoceros-563.convex.cloud%2Fapi%2Fstorage%2F778723f7-6a6e-49fc-baf6-184f27f576f7&w=1920&q=75",
  //     isSharedPlan: true,
  //     fromDate: null,
  //     toDate: null,
  //     nameoftheplace: "Tokyo, Japan",
  //   },
  // ];

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
