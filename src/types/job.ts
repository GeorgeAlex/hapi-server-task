import { Document } from 'mongoose'

export enum JobType {
  ON_DEMAND = 'ON_DEMAND',
  SHIFT = 'SHIFT',
  SCHEDULED = 'SCHEDULED',
}

export enum JobStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
}

export interface JobPatch {
  status: JobStatus,
  contactEmail?: string,
}

export interface JobInput extends JobPatch {
  type: JobType,
  priceInPence: number,
}

export interface JobDocument extends JobInput, Document {
  createdAt: string,
  updatedAt?: string,
}

export interface JobResponse extends JobDocument {
  id: string,
}
