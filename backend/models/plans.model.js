import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    isGeneratedUsingAI: { type: Boolean, required: true },
    planID: { type: String, required: true },
    storageId: { type: mongoose.Schema.Types.ObjectId, ref: "Storage", default: null },
    nameoftheplace: { type: String, required: true },
    userPrompt: { type: String, required: true },
    abouttheplace: { type: String, required: true },
    adventuresactivitiestodo: { type: [String], required: true },
    topplacestovisit: [
      {
        name: { type: String, required: true },
        coordinates: {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      },
    ],
    packingchecklist: { type: [String], required: true },
    localcuisinerecommendations: { type: [String], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    besttimetovisit: { type: String, required: true },
    itinerary: [
      {
        title: { type: String, required: true },
        activities: {
          morning: [
            {
              itineraryItem: { type: String, required: true },
              briefDescription: { type: String, required: true },
            },
          ],
          afternoon: [
            {
              itineraryItem: { type: String, required: true },
              briefDescription: { type: String, required: true },
            },
          ],
          evening: [
            {
              itineraryItem: { type: String, required: true },
              briefDescription: { type: String, required: true },
            },
          ],
        },
      },
    ],
    contentGenerationState: {
      imagination: { type: Boolean, required: true },
      abouttheplace: { type: Boolean, required: true },
      adventuresactivitiestodo: { type: Boolean, required: true },
      topplacestovisit: { type: Boolean, required: true },
      itinerary: { type: Boolean, required: true },
      localcuisinerecommendations: { type: Boolean, required: true },
      packingchecklist: { type: Boolean, required: true },
      besttimetovisit: { type: Boolean, required: true },
    },
  },
  { timestamps: true }
);

// Create indexes
PlanSchema.index({ userId: 1 });

export const Plan = mongoose.model("Plan", PlanSchema);
