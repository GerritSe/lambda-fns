const createLambdaHandler = require('../createLambdaHandler')

describe('createLambdaHandler', () => {
  const event = {}
  const context = {}
  const callback = jest.fn()

  describe('without middlewares', () => {
    it('calls the handler', () => {
      const response = { statusCode: 200 }
      const handler = jest.fn().mockReturnValue(response)

      const result = createLambdaHandler(handler)(event, context, callback)

      expect(result).toEqual(response)
      expect(handler).toHaveBeenCalledWith(event, context, callback)
    })
  })

  describe('with middlewares', () => {
    const middleware = jest.fn(next => (event, ctx, cb) => {
      expect(ctx).toEqual(context)
      expect(cb).toEqual(callback)

      const result = next({ ...event, body: 'passed' })
      return { ...result, body: `${result.body} extended` }
    })
    const handler = jest.fn().mockReturnValue({ body: 'value' })
    const result = createLambdaHandler(middleware, handler)(event, context, callback)

    expect(result).toEqual({ body: 'value extended' })
    expect(handler).toHaveBeenCalledWith({ body: 'passed' }, context, callback)
  })

  describe('with multiple middlewares', () => {
    const addTwo = next => event => next({ ...event, body: '2' })
    const addFourAfterwards = next => event => {
      const result = next(event)
      return { ...result, body: `${result.body}4` }
    }
    const addSeven = next => event => next({ ...event, body: `${event.body}7` })
    const handler = event => ({ body: `${event.body}handler` })
    const result = createLambdaHandler(addTwo, addFourAfterwards, addSeven, handler)(event, context, callback)

    expect(result).toEqual({ body: '27handler4' })
  })
})
