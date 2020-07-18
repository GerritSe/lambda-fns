const isPromise = require('../isPromise')

const rescueFrom = (...errors) => {
  const handleError = (e, rejectedPromise) => {
    for (const [ErrorClass, rescueWith] of errors) {
      if (ErrorClass === undefined || e instanceof ErrorClass) {
        return rescueWith(e, rejectedPromise)
      }
    }

    throw e
  }

  return next => event => {
    try {
      const response = next(event)

      return isPromise(response)
        ? response.catch(e => handleError(e, response))
        : response
    } catch (e) {
      return handleError(e)
    }
  }
}

module.exports = rescueFrom
