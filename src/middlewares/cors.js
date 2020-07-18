const isPromise = require('../isPromise')

const cors = (options = {}) => {
  const {
    methods = ['GET', 'OPTIONS', 'POST'],
    origins = []
  } = options

  const isOriginAllowed = origin => {
    if (!origin || origins.length === 0) return true
    return origins.includes(origin)
  }

  const headersForOrigin = origin => ({
    'access-control-allow-methods': methods.join(','),
    ...isOriginAllowed(origin) && { 'access-control-allow-origin': origin }
  })

  const getResponseRendererForOrigin = origin => response => ({
    ...response,
    headers: {
      ...response.headers,
      ...headersForOrigin(origin)
    }
  })

  return next => event => {
    const { headers: { origin }, httpMethod } = event

    if (httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: headersForOrigin(origin) }
    }

    const response = next(event)
    const respond = getResponseRendererForOrigin(origin)

    return isPromise(response)
      ? response.then(respond)
      : respond(response)
  }
}

module.exports = cors
