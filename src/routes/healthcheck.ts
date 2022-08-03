import { HealthcheckHandlers } from '../handlers'

export default {
  Get: {
    method: 'GET',
    path: '/healthcheck',
    options: {
      handler: HealthcheckHandlers.healthcheckHandler,
      description: 'Healthcheck endpoint',
    },
  },
}
