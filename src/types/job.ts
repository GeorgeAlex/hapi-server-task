import { Document } from "mongoose"

export interface JobDocument extends Document {
  type: JobTypes,
  priceInPence: number,
  contactEmail: string,
  status: JobStatus,
  createdAt: string,
  updatedAt?: string,
}

export enum JobTypes {
  ON_DEMAND = 'ON_DEMAND',
  SHIFT = 'SHIFT',
  SCHEDULED = 'SCHEDULED'
}

export enum JobStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED'
}
