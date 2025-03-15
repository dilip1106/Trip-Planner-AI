// backend/services/groq.service.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client with Groq's base URL
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const promptSuffix = `generate travel data according to the schema and in json format,
                     do not return anything in your response outside of curly braces, 
                     generate response as per the schema provided.`;

const callGroqApi = async (prompt, schema, description) => {
  console.log({ prompt, schema });
  try {
    // For Groq, we'll use a simpler approach with chat completions
    // Since function calling might not be fully compatible
    const systemPrompt = `You are a helpful travel assistant. ${description} 
    Return ONLY valid JSON that matches exactly the following schema:
    ${JSON.stringify(schema, null, 2)}
    
    Do not include ANY explanatory text before or after the JSON. 
    The response should be parseable JSON only.`;
    
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192", // Groq model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the content directly since we're asking for JSON
    const content = response.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse JSON response from Groq');
    }
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate travel plan');
  }
};

// Define schemas for the different data batches
const batch1Schema = {
  type: "object",
  properties: {
    abouttheplace: {
      type: "string",
      description: "about the place in atleast 50 words",
    },
    besttimetovisit: {
      type: "string",
      description: "Best time to visit",
    },
  },
  required: [
    "abouttheplace",
    "besttimetovisit"
  ],
};

const batch2Schema = {
  type: "object",
  properties: {
    adventuresactivitiestodo: {
      type: "array",
      description: "Top adventures activities, atleast 5, like trekking, water sports, specify the place also",
      items: { type: "string" },
    },
    localcuisinerecommendations: {
      type: "array",
      description: "Local Cuisine Recommendations",
      items: { type: "string" },
    },
    packingchecklist: {
      type: "array",
      description: "Packing Checklist",
      items: { type: "string" },
    },
  },
  required: [
    "adventuresactivitiestodo",
    "localcuisinerecommendations",
    "packingchecklist"
  ],
};

const batch3Schema = {
  type: "object",
  properties: {
    itinerary: {
      type: "array",
      description: "Itinerary for the specified number of days in array format",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Day title" },
          activities: {
            type: "object",
            properties: {
              morning: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string", description: "About the itinerary item" },
                    briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
              afternoon: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string", description: "About the itinerary item" },
                    briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
              evening: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string", description: "About the itinerary item" },
                    briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
            },
            required: ["morning", "afternoon", "evening"],
          },
        },
        required: ["title", "activities"],
      },
    },
    topplacestovisit: {
      type: "array",
      description: "Top places to visit along with their coordinates, atelast top 5, can be more",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the place" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" },
            },
            required: ["lat", "lng"],
          },
        },
        required: ["name", "coordinates"],
      },
    },
  },
  required: [
    "itinerary",
    "topplacestovisit"
  ],
};

// Get formatted prompt with all parameters
const getFormattedPrompt = ({ userPrompt, activityPreferences, companion, fromDate, toDate }) => {
  let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

  if (companion && companion.length > 0) {
    prompt += `, travelling with-${companion}`;
  }

  if (activityPreferences && activityPreferences.length > 0) {
    prompt += `, activity preferences-${activityPreferences.join(",")}`;
  }

  prompt = `${prompt}, ${promptSuffix}`;
  return prompt;
};

// Generate basic info about the place
const generateBasicInfo = async (promptText) => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `Generate a description of information about a place or location according to the following schema:

  - About the Place:
    - A string containing information about the place, comprising at least 50 words.
  
  - Best Time to Visit:
    - A string specifying the best time to visit the place.
  
  Ensure that the response adheres to the schema provided and is in JSON format.`;
  
  return await callGroqApi(prompt, batch1Schema, description);
};

// Generate adventure activities and recommendations
const generateActivities = async (inputParams) => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:
  - Top Adventures Activities:
    - An array listing top adventure activities to do, including at least 5 activities.
    - Each activity should be specified along with its location.
  
  - Local Cuisine Recommendations:
    - An array providing recommendations for local cuisine to try during the trip.
  
  - Packing Checklist:
    - An array containing items that should be included in the packing checklist for the trip.
  
  Ensure that the response adheres to the schema provided and is in JSON format.`;
  
  return await callGroqApi(getFormattedPrompt(inputParams), batch2Schema, description);
};

// Generate full itinerary and places to visit
const generateItinerary = async (inputParams) => {
  const description = `Generate a description of a travel itinerary and top places to visit according to the following schema:
  - Itinerary:
    - An array containing details of the itinerary for the specified number of days.
    - Each day's itinerary includes a title and activities for morning, afternoon, and evening.
    - Activities are described as follows:
      - Morning, Afternoon, Evening:
        - Each includes an array of itinerary items, where each item has a description and a brief description.
  
  - Top Places to Visit:
    - An array listing the top places to visit along with their coordinates.
    - Each place includes a name and coordinates (latitude and longitude).
  
  Ensure that the response adheres to the schema provided and is in JSON format.`;
  
  return await callGroqApi(getFormattedPrompt(inputParams), batch3Schema, description);
};

export { generateBasicInfo, generateActivities, generateItinerary };