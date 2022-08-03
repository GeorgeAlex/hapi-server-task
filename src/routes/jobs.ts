import Joi from 'joi'
import Boom from '@hapi/boom'
import { JobsHandlers } from '../handlers'
import { JobStatus, JobType } from '../types'

export default [
  {
    method: 'GET',
    path: '/jobs',
    options: {
      handler: JobsHandlers.getJobsHandler,
      description: 'Get the list of all the jobs',
    },
  },
  {
    method: 'POST',
    path: '/jobs',
    options: {
      handler: JobsHandlers.postJobsHandler,
      description: 'Create a new job',
      validate: {
        payload: Joi.object({
          type: Joi.string().valid(JobType.ON_DEMAND, JobType.SCHEDULED, JobType.SHIFT).required().messages({
            'any.required': 'type is required',
            'any.only': `type must be one of [${Object.values(JobType)}]`,
          }),
          priceInPence: Joi.number().min(0).required().messages({
            'number.base': 'priceInPence must be a number',
            'number.min': 'priceInPence must be a positive number',
            'any.required': 'priceInPence is required',
          }),
          contactEmail: Joi.string().trim().email().messages({
            'string.email': 'contactEmail must be a valid email address',
          }),
          status: Joi.string().valid(JobStatus.ASSIGNED, JobStatus.AVAILABLE, JobStatus.COMPLETED).required().messages({
            'any.required': 'status is required',
            'any.only': `status must be one of [${Object.values(JobStatus)}]`,
          }),
        }).options({ stripUnknown: true }),
        failAction: (request: any, h: any, err: any) => {
          console.error('Failed to validate job payload', err.details)
          const boomErr = Boom.badRequest('Invalid request')
          boomErr.output.payload.details = err.details.map((d: any) => d.message)
          return boomErr
        }
      },
    },
  },
]
