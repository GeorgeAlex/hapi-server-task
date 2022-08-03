import { Request, ResponseToolkit } from '@hapi/hapi'
import Boom from '@hapi/boom'
import { Job } from '../db'
import { JobInput } from '../types'
import { formatJobDocumentForResponse } from '../utils'

export const getJobsHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const jobs = await Job.find({})

    return h.response({
      jobs: jobs.map(job => formatJobDocumentForResponse(job))
    })
  } catch(err) {
    console.error('Failed to retrieve job list', err)
    return Boom.badImplementation('Failed to retrieve job list')
  }
}

export const postJobsHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const jobPayload = request.payload as JobInput
    const {
      type,
      priceInPence,
      contactEmail,
      status,
    } = jobPayload
    
    const newJobDetails: JobInput = {
      type,
      priceInPence,
      contactEmail,
      status,
    }
    
    const job = await Job.new(newJobDetails)

    return h.response({
      job: formatJobDocumentForResponse(job)
    }).code(201)
  } catch(err) {
    console.error('Failed to create job', err)
    return Boom.badImplementation('Failed to create job')
  }
}
