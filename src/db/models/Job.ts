import { Schema, model } from 'mongoose'
import { JobDocument, JobTypes, JobStatus } from '../../types'

const ISODateRegex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

const schema = new Schema(
  {
    type: { type: String, required: true, enum: Object.values(JobTypes) },
    priceInPence: { type: Number, required: true, min: 0 },
    contactEmail: { type: String, trim: true, match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ },
    status: { type: String, required: true, enum: Object.values(JobStatus) },
    createdAt: { type: String, required: true, match: ISODateRegex },
    updatedAt: { type: String, match: ISODateRegex, default: null },
  }
)

export default model<JobDocument>('Job', schema)