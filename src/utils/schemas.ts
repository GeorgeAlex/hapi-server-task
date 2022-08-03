import Joi from 'joi'

import { JobStatus, JobType } from '../types'

export const idParamSchema = Joi.object({
  id: Joi.string().guid().messages({
    'string.guid': 'id must be a valid UUID',
  }),
})

const contactEmailField = Joi.string().trim().email().messages({
  'string.email': 'contactEmail must be a valid email address',
})

const jobStatusField = Joi.string()
  .valid(JobStatus.ASSIGNED, JobStatus.AVAILABLE, JobStatus.COMPLETED)
  .required()
  .messages({
    'any.required': 'status is required',
    'any.only': `status must be one of [${Object.values(JobStatus)}]`,
  })

export const jobPostPayloadSchema = Joi.object({
  type: Joi.string()
    .valid(JobType.ON_DEMAND, JobType.SCHEDULED, JobType.SHIFT)
    .required()
    .messages({
      'any.required': 'type is required',
      'any.only': `type must be one of [${Object.values(JobType)}]`,
    }),
  priceInPence: Joi.number().min(0).required().messages({
    'number.base': 'priceInPence must be a number',
    'number.min': 'priceInPence must be a positive number',
    'any.required': 'priceInPence is required',
  }),
  contactEmail: contactEmailField,
  status: jobStatusField,
}).options({ stripUnknown: true })

export const jobPatchPayloadSchema = Joi.object({
  contactEmail: contactEmailField,
  status: jobStatusField,
}).options({ stripUnknown: true })
