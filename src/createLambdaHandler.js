const createLambdaHandler = (...middlewares) => (event, context, callback) =>
  middlewares.reduceRight((next, middleware) => middleware(result => next(result, context, callback)))(event, context, callback)

module.exports = createLambdaHandler
