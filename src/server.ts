import Hapi, { Server } from '@hapi/hapi'
import { HealthcheckRoutes, JobsRoutes } from './routes'
import { connect, closeDatabase } from './db/connection'

const init = async (): Promise<Server> => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  })

  // Routes
  server.route(HealthcheckRoutes.Get)
  server.route(JobsRoutes)

  return server
}

export const start = async (): Promise<Server> => {
  // Start the in-memory DB
  await connect()

  const server = await init()
  await server.start()
  console.log(`Listening on ${server.settings.host}:${server.settings.port}`)

  return server
}

process.on('unhandledRejection', async err => {
  console.error('unhandledRejection')
  console.error(err)
  await closeDatabase()
  process.exit(1)
})
