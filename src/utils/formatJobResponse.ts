import { omit } from 'ramda'
import { renameKeys } from 'ramda-adjunct'
import { JobDocument, JobResponse } from '../types'

export const formatJobDocumentForResponse = (job: JobDocument): JobResponse => omit(['__v'], renameKeys({ _id: 'id' }, job.toObject())) as JobResponse