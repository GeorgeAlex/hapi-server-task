import Hapi, { Server } from '@hapi/hapi'
import { HealthcheckRoutes } from './routes'
import { connect, closeDatabase } from './db'

const init = async (): Promise<Server> => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  })

  // Routes will go here
  server.route(HealthcheckRoutes.Get)
  return server
}

export const start = async (): Promise<void> => {
  // Start the in-memory DB
  await connect()

  const server = await init()
  await server.start()
  console.log(`Listening on ${server.settings.host}:${server.settings.port}`)
}

process.on('unhandledRejection', err => {
  console.error('unhandledRejection')
  console.error(err)
  closeDatabase()
  process.exit(1)
})
