import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
const User = models.User || model("User", userSchema);

export default User;
