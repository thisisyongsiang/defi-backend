import { mongooseConnection } from "../mongo";
import { Schema } from "mongoose";

export type Project = {
  id?: string;
  contractAddress?: string;
  investors?: string[];
  owners: string[];
  startDate: Date;
  endDate: Date;
  minInvestment: number;
  quorom: number;
  fundingAmount?: number;
  stages?: number;
  currentStage?: number;
  name: string;
  status: "UNSTARTED" | "DEPLOYED" | "UNFUNDED" | "FUNDED" | "ENDED";
};

const project = new Schema<Project>({
  name: String,
  contractAddress: String,
  investors: [String],
  owners: [String],
  startDate: Date,
  endDate: Date,
  minInvestment: Number,
  quorom: Number,
  fundingAmount: Number,
  stages: Number,
  currentStage: Number,
  status: String,
});
export const toProject = (doc: any): Project | null => {
  if (!doc) return null;
  return {
    name: doc.name,
    id: doc._id.toString(),
    contractAddress: doc.contractAddress,
    investors: doc.investors,
    owners: doc.owners,
    startDate: doc.startDate,
    endDate: doc.endDate,
    minInvestment: doc.minInvestment,
    quorom: doc.quorom,
    fundingAmount: doc.fundingAmount,
    stages: doc.stages,
    currentStage: doc.currentStage,
    status: doc.status,
  };
};
export const projectModel = mongooseConnection.model("project", project);
