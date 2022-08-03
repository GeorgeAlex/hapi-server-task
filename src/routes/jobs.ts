import Boom from '@hapi/boom'
import { JobsHandlers } from '../handlers'
import { idParamSchema, jobPatchPayloadSchema, jobPostPayloadSchema } from '../utils'

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
        payload: jobPostPayloadSchema,
        failAction: (request: any, h: any, err: any) => {
          console.error('Failed to validate POST /jobs payload', err.details)
          const boomErr = Boom.badRequest('Invalid request')
          boomErr.output.payload.details = err.details.map((d: any) => d.message)
          return boomErr
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/jobs/{id}',
    options: {
      handler: JobsHandlers.getJobHandler,
      description: 'Get job details',
      validate: {
        params: idParamSchema,
        failAction: (request: any, h: any, err: any) => {
          console.error('Failed to validate GET /jobs/{id} parameter', err.details)
          const boomErr = Boom.badRequest('Invalid request')
          boomErr.output.payload.details = err.details.map((d: any) => d.message)
          return boomErr
        },
      },
    },
  },
  {
    method: 'PATCH',
    path: '/jobs/{id}',
    options: {
      handler: JobsHandlers.patchJobHandler,
      description: "Update a job's details",
      validate: {
        params: idParamSchema,
        payload: jobPatchPayloadSchema,
        failAction: (request: any, h: any, err: any) => {
          console.error('Failed to validate PATCH /jobs/{id} parameter or payload', err.details)
          const boomErr = Boom.badRequest('Invalid request')
          boomErr.output.payload.details = err.details.map((d: any) => d.message)
          return boomErr
        },
      },
    },
  },

  {
    method: 'DELETE',
    path: '/jobs/{id}',
    options: {
      handler: JobsHandlers.deleteJobHandler,
      description: 'Delete a job',
      validate: {
        params: idParamSchema,
        failAction: (request: any, h: any, err: any) => {
          console.error('Failed to validate DELETE /jobs/{id} parameter', err.details)
          const boomErr = Boom.badRequest('Invalid request')
          boomErr.output.payload.details = err.details.map((d: any) => d.message)
          return boomErr
        },
      },
    },
  },
]
