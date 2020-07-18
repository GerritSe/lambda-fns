const createLambdaHandler = (...middlewares) => async (event, context) =>
  middlewares.reduceRight((next, middleware) => middleware(result => next(result, context)))(event, context)

module.exports = createLambdaHandler
