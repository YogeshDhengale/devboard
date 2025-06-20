import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const USER_SCHEMA = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

// ✅ Fix: use mongoose.models.User with type casting
const UserModel =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", USER_SCHEMA);

export default UserModel;
