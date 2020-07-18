const isPromise = require('../isPromise')

const getOriginMatcher = origins => {
  const matcherOrigins = origins.map(origin => new RegExp(`^(https?://)?${origin}$`))
  return origin => matcherOrigins.some(matcherOrigin => matcherOrigin.test(origin))
}

const cors = (options = {}) => {
  const {
    methods = ['GET', 'OPTIONS', 'POST'],
    origins = []
  } = options
  const matchesOrigin = getOriginMatcher(origins)

  const isOriginAllowed = origin => {
    if (origins.length === 0) return true
    return matchesOrigin(origin)
  }

  const headersForOrigin = origin => ({
    'access-control-allow-methods': methods.join(','),
    ...origin && isOriginAllowed(origin) && { 'access-control-allow-origin': origin }
  })

  const getResponseRendererForOrigin = origin => response => ({
    ...response,
    headers: {
      ...response.headers,
      ...headersForOrigin(origin)
    }
  })

  return next => (event, _, callback) => {
    const { headers: { origin }, httpMethod } = event

    if (httpMethod === 'OPTIONS') {
      callback(null, { statusCode: 200, headers: headersForOrigin(origin) })
      return
    }

    const response = next(event)
    const respond = getResponseRendererForOrigin(origin)

    return isPromise(response)
      ? response.then(respond)
      : respond(response)
  }
}

module.exports = cors
