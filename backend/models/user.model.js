import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    credits: { type: Number, required: true, default: 0 },
    freeCredits: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Create indexes
UserSchema.index({ userId: 1 });
UserSchema.index({ email: 1 });

const User = mongoose.model("User", UserSchema);
export default User;
