import { Request, ResponseToolkit } from '@hapi/hapi'

export const healthcheckHandler = async (request: Request, h: ResponseToolkit) => h.response({
  status: 'OK',
})
