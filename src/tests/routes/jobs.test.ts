import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Server } from '@hapi/hapi'

import { start } from '../../server'
import { JobStatus, JobType } from '../../types'
import { closeDatabase, Job } from '../../db'
import { formatJobDocumentForResponse } from '../../utils'

const lab = Lab.script()
const { describe, it, beforeEach, afterEach } = lab
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
                url: '/jobs'
            })

            expect(res.statusCode).to.equal(200)
        })

        it('responds with empty array when there are no jobs', async () => {
            const res = await server.inject({
                method: 'get',
                url: '/jobs'
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
                url: '/jobs'
            })
            const parsedResponse = JSON.parse(res.payload)

            expect(parsedResponse.jobs).to.equal([
                {
                    ...job1Response,
                    id: job1Response.id.toString(),
                },
                {
                    ...job2Response,
                    id: job2Response.id.toString(),
                }
            ])
        })
    })

    describe('POST', () => {
        describe('returns 400', () => {
            it('when type is missing on the request', async () => {
                const res = await server.inject({
                    method: 'post',
                    url: '/jobs',
                    payload: {
                        "priceInPence": 1500,
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": "wrong",
                        "priceInPence": 1500,
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": 1,
                        "priceInPence": 1500,
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": "ON_DEMAND",
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": "ON_DEMAND",
                        "priceInPence": -1500,
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": "ON_DEMAND",
                        "priceInPence": "string",
                        "contactEmail":"test@email.com",
                        "status": "AVAILABLE"
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
                        "type": "ON_DEMAND",
                        "priceInPence": 1500,
                        "contactEmail":"testemail",
                        "status": "AVAILABLE"
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
                        "type": "ON_DEMAND",
                        "priceInPence": 1500,
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
                        "type": "ON_DEMAND",
                        "priceInPence": 1500,
                        "status": "wrong",
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
                    "type": "ON_DEMAND",
                    "priceInPence": 1500,
                    "status": "AVAILABLE",
                },
            })

            expect(res.statusCode).to.equal(201)
        })

        it('return the newly created job', async () => {
            const res = await server.inject({
                method: 'post',
                url: '/jobs',
                payload: {
                    "type": "ON_DEMAND",
                    "priceInPence": 1500,
                    "contactEmail": "email@test.com",
                    "status": "AVAILABLE",
                },
            })
            const parsedResponse = JSON.parse(res.payload)

            const dbJob = await Job.findById(parsedResponse.job.id)

            // @ts-ignore
            const expectedJob = formatJobDocumentForResponse(dbJob)

            expect(parsedResponse.job).to.equal({
                ...expectedJob,
                id: expectedJob.id.toString(),
            })
        })
    })
})