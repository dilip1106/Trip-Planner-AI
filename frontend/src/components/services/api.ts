import axios from 'axios';

// Define a base URL for your API
const API_URL = 'http://localhost:4000'; // Update with your actual backend URL

// Function to add a day in the itinerary
export const addDayInItinerary = async (planId: string, itinerary: any) => {
  try {
    const response = await axios.post(`${API_URL}/plan/${planId}/add-day`, itinerary);
    return response.data; // Return the response from the backend
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// Add other API functions here as needed
