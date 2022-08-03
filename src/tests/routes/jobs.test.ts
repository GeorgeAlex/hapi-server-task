import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Server } from '@hapi/hapi'
import { NIL, v4 as uuidv4 } from 'uuid'

import { start } from '../../server'
import { JobStatus, JobType } from '../../types'
import { closeDatabase, Job } from '../../db'
import { formatJobDocumentForResponse } from '../../utils'

const lab = Lab.script()
const {
  describe, it, beforeEach, afterEach,
} = lab
export { lab }

describe('ROUTE: /jobs', () => {
  let server: Server

  beforeEach(async () => {
    server = await start()
  })

  afterEach(async () => {
    await server.stop()
    await closeDatabase()
  })

  describe('GET', () => {
    it('responds with 200', async () => {
      const res = await server.inject({
        method: 'get',
        url: '/jobs',
      })

      expect(res.statusCode).to.equal(200)
    })

    it('responds with empty array when there are no jobs', async () => {
      const res = await server.inject({
        method: 'get',
        url: '/jobs',
      })
      const parsedResponse = JSON.parse(res.payload)

      expect(parsedResponse.jobs).to.equal([])
    })

    it('responds with an array containing the existing jobs', async () => {
      const job1 = await Job.new({
        type: JobType.ON_DEMAND,
        priceInPence: 100,
        status: JobStatus.AVAILABLE,
      })
      const job1Response = formatJobDocumentForResponse(job1)

      const job2 = await Job.new({
        type: JobType.SHIFT,
        priceInPence: 500,
        status: JobStatus.ASSIGNED,
        contactEmail: 'test@email.com',
      })

      const job2Response = formatJobDocumentForResponse(job2)

      const res = await server.inject({
        method: 'get',
        url: '/jobs',
      })
      const parsedResponse = JSON.parse(res.payload)

      expect(parsedResponse.jobs).to.equal([job2Response, job1Response])
    })
  })

  describe('POST', () => {
    describe('returns 400', () => {
      it('when type is missing on the request', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            priceInPence: 1500,
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['type is required'])
      })

      it('when type has a wrong value', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: 'wrong',
            priceInPence: 1500,
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['type must be one of [ON_DEMAND,SHIFT,SCHEDULED]'])
      })

      it('when type is not a string', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: 1,
            priceInPence: 1500,
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['type must be one of [ON_DEMAND,SHIFT,SCHEDULED]'])
      })

      it('when priceInPence is missing on the request', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['priceInPence is required'])
      })

      it('when priceInPence is a negative value', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            priceInPence: -1500,
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['priceInPence must be a positive number'])
      })

      it('when priceInPence is not an integer', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            priceInPence: 'string',
            contactEmail: 'test@email.com',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['priceInPence must be a number'])
      })

      it('when contactEmail is not a valid email address', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            priceInPence: 1500,
            contactEmail: 'testemail',
            status: JobStatus.AVAILABLE,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['contactEmail must be a valid email address'])
      })

      it('when status is missing on the request', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            priceInPence: 1500,
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['status is required'])
      })

      it('when status has a wrong value', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/jobs',
          payload: {
            type: JobType.ON_DEMAND,
            priceInPence: 1500,
            status: 'wrong',
          },
        })
        const parsedResponse = JSON.parse(res.payload)

        expect(res.statusCode).to.equal(400)
        expect(parsedResponse.details).to.equal(['status must be one of [AVAILABLE,ASSIGNED,COMPLETED]'])
      })
    })

    it('responds with 200', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/jobs',
        payload: {
          type: JobType.ON_DEMAND,
          priceInPence: 1500,
          status: JobStatus.AVAILABLE,
        },
      })

      expect(res.statusCode).to.equal(201)
    })

    it('return the newly created job', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/jobs',
        payload: {
          type: JobType.ON_DEMAND,
          priceInPence: 1500,
          contactEmail: 'email@test.com',
          status: JobStatus.AVAILABLE,
        },
      })
      const parsedResponse = JSON.parse(res.payload)

      const dbJob = await Job.findOne({ id: parsedResponse.job.id })

      // @ts-ignore - we are testing the response, it is not null
      const expectedJob = formatJobDocumentForResponse(dbJob)

      expect(parsedResponse.job).to.equal(expectedJob)
    })
  })

  describe('GET /jobs/{id}', () => {
    it('responds with 400 when passed in an invalid id', async () => {
      const res = await server.inject({
        method: 'get',
        url: '/jobs/invalid-id',
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['id must be a valid UUID'])
    })

    it('responds with 404 when passed in an id that does not exist', async () => {
      const res = await server.inject({
        method: 'get',
        url: `/jobs/${NIL}`,
      })

      expect(res.statusCode).to.equal(404)
      expect(JSON.parse(res.payload).message).to.equal(`Job with id ${NIL} does not exist`)
    })

    it('responds with 200 and returns an existing job', async () => {
      const job = await Job.new({
        type: JobType.ON_DEMAND,
        priceInPence: 100,
        status: JobStatus.AVAILABLE,
      })
      const jobResponse = formatJobDocumentForResponse(job)

      const res = await server.inject({
        method: 'get',
        url: `/jobs/${job.id}`,
      })

      expect(res.statusCode).to.equal(200)
      expect(JSON.parse(res.payload).job).to.equal(jobResponse)
    })
  })

  describe('PATCH /jobs/{id}', () => {
    it('responds with 400 when passed in an invalid id', async () => {
      const res = await server.inject({
        method: 'patch',
        url: '/jobs/invalid-id',
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['id must be a valid UUID'])
    })

    it('responds with 400 when passed invalid status', async () => {
      const res = await server.inject({
        method: 'patch',
        url: `/jobs/${uuidv4()}`,
        payload: {
          status: 'wrong',
        },
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['status must be one of [AVAILABLE,ASSIGNED,COMPLETED]'])
    })

    it('responds with 400 when status is missing', async () => {
      const res = await server.inject({
        method: 'patch',
        url: `/jobs/${uuidv4()}`,
        payload: {
          contactEmail: 'email@dom.com',
        },
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['status is required'])
    })

    it('responds with 400 when passed invalid email address', async () => {
      const res = await server.inject({
        method: 'patch',
        url: `/jobs/${uuidv4()}`,
        payload: {
          status: JobStatus.AVAILABLE,
          contactEmail: 'invalidemail',
        },
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['contactEmail must be a valid email address'])
    })

    it('responds with 404 when passed in an id that does not exist', async () => {
      const id = uuidv4()
      const res = await server.inject({
        method: 'patch',
        url: `/jobs/${id}`,
        payload: {
          status: JobStatus.AVAILABLE,
        },
      })

      expect(res.statusCode).to.equal(404)
      expect(JSON.parse(res.payload).message).to.equal(`Job with id ${id} does not exist`)
    })

    it('responds with 200 and returns the updated job', async () => {
      const job = await Job.new({
        type: JobType.ON_DEMAND,
        priceInPence: 100,
        status: JobStatus.AVAILABLE,
      })

      const patch = {
        status: JobStatus.ASSIGNED,
        contactEmail: 'new@email.com',
      }

      const res = await server.inject({
        method: 'patch',
        url: `/jobs/${job.id}`,
        payload: patch,
      })

      const updatedJob = await Job.findOne({ id: job.id })

      // @ts-ignore - we are testing the response, it is not null
      const jobResponse = formatJobDocumentForResponse(updatedJob)
      console.log('jobResponse', jobResponse)

      expect(res.statusCode).to.equal(200)
      expect(jobResponse.status).to.equal(patch.status)
      expect(jobResponse.contactEmail).to.equal(patch.contactEmail)
      // @ts-ignore - we are testing the response, it is not null
      expect(jobResponse.updatedAt).to.not.equal(null)
      expect(JSON.parse(res.payload).job).to.equal(jobResponse)
    })
  })

  describe('DELETE /jobs/{id}', () => {
    it('responds with 400 when passed in an invalid id', async () => {
      const res = await server.inject({
        method: 'delete',
        url: '/jobs/invalid-id',
      })

      expect(res.statusCode).to.equal(400)
      expect(JSON.parse(res.payload).details).to.equal(['id must be a valid UUID'])
    })

    it('responds with 204 when passed in an id for a job that does not exist', async () => {
      const res = await server.inject({
        method: 'delete',
        url: `/jobs/${NIL}`,
      })

      expect(res.statusCode).to.equal(204)
    })

    it('responds with 204 after deleting a job', async () => {
      const job = await Job.new({
        type: JobType.ON_DEMAND,
        priceInPence: 100,
        status: JobStatus.AVAILABLE,
      })

      const res = await server.inject({
        method: 'delete',
        url: `/jobs/${job.id}`,
      })

      const deletedJob = await Job.findOne({ id: job.id })

      expect(res.statusCode).to.equal(204)
      expect(deletedJob).to.equal(null)
    })
  })
})
