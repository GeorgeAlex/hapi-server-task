import { omit } from 'ramda'
import { JobDocument, JobResponse } from '../types'

export const formatJobDocumentForResponse = (job: JobDocument): JobResponse => omit(['__v', '_id'], job.toObject()) as JobResponse
