const rescueFrom = (...errors) => next => async event => {
  try {
    return await next(event)
  } catch (e) {
    for (const [ErrorClass, rescueWith] of errors) {
      if (ErrorClass === undefined || e instanceof ErrorClass) {
        return rescueWith(e)
      }
    }

    throw e
  }
}

module.exports = rescueFrom
