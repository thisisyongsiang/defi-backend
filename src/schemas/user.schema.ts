import { mongooseConnection } from "../mongo";
import { Schema } from "mongoose";

export type User = {
  walletAddress: string;
  email?: string;
  id?: string;
  notifications?: {
    message: string;
    status: "UNREAD" | "READ";
  }[];
  projects?: string[];
};

const user = new Schema<User>({
  walletAddress: { type: String, index: true },
  email: String,
  notifications: [
    {
      message: String,
      status: String,
    },
  ],
  projects: [Schema.ObjectId],
});

export const toUser = (doc: any): User | null => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    walletAddress: doc.walletAddress,
    email: doc.email,
    notifications: doc.notifications,
    projects: doc.projects,
  };
};
export const userModel = mongooseConnection.model("user", user);
