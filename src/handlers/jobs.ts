import { Request, ResponseToolkit } from '@hapi/hapi'
import Boom from '@hapi/boom'
import { Job } from '../db'
import { JobInput, JobPatch } from '../types'
import { formatJobDocumentForResponse } from '../utils'

export const getJobsHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 })

    return h.response({
      jobs: jobs.map(job => formatJobDocumentForResponse(job)),
    })
  } catch (err) {
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
      job: formatJobDocumentForResponse(job),
    }).code(201)
  } catch (err) {
    console.error('Failed to create job', err)
    return Boom.badImplementation('Failed to create job')
  }
}

export const getJobHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params
    const job = await Job.findOne({ id })

    if (!job) {
      return Boom.notFound(`Job with id ${id} does not exist`)
    }

    return h.response({
      job: formatJobDocumentForResponse(job),
    })
  } catch (err) {
    console.error('Failed to retrieve job list', err)
    return Boom.badImplementation('Failed to retrieve job')
  }
}

export const patchJobHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params
    const job = await Job.findOne({ id })

    if (!job) {
      return Boom.notFound(`Job with id ${id} does not exist`)
    }

    const updatedJob = await Job.patch(id, request.payload as JobPatch)

    return h.response({
      job: formatJobDocumentForResponse(updatedJob),
    })
  } catch (err) {
    console.error('Failed to update job', err)
    return Boom.badImplementation('Failed to update job')
  }
}

export const deleteJobHandler = async (request: Request, h: ResponseToolkit) => {
  try {
    const { id } = request.params
    const job = await Job.findOne({ id })

    // If the job exists then delete it
    if (job) {
      await Job.deleteOne({ id })
    }

    return h.response().code(204)
  } catch (err) {
    console.error('Failed to delete job', err)
    return Boom.badImplementation('Failed to delete job')
  }
}
