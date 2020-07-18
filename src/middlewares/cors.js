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

  return next => async event => {
    const { headers: { origin }, httpMethod } = event

    if (httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: headersForOrigin(origin) }
    }

    const response = await next(event)

    return {
      ...response,
      headers: {
        ...response.headers,
        ...headersForOrigin(origin)
      }
    }
  }
}

module.exports = cors
