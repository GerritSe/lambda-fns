const cors = require('../cors')

describe('cors', () => {
  describe('with no explicit origins whitelisted', () => {
    it('whitelists all origins', () => {
      const event = { headers: { origin: 'app.service.de' }, httpMethod: 'GET' }
      const next = jest.fn().mockReturnValue({ statusCode: 200, body: 'value' })
      const result = cors()(next)(event)

      expect(result).toEqual({
        body: 'value',
        headers: {
          'access-control-allow-origin': 'app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
      expect(next).toHaveBeenCalledWith(event)
    })
  })

  describe('with whitelisted origins', () => {
    it('allows whitelisted origins', () => {
      const event = { headers: { origin: 'app.service.de' }, httpMethod: 'GET' }
      const next = jest.fn().mockReturnValue({ statusCode: 200 })
      const result = cors({ origins: ['app.service.de'] })(next)(event)

      expect(result).toEqual({
        headers: {
          'access-control-allow-origin': 'app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
    })

    it('disallows non-whitelisted origins', () => {
      const event = { headers: { origin: 'app.service.de' }, httpMethod: 'GET' }
      const next = jest.fn().mockReturnValue({ statusCode: 200 })
      const result = cors({ origins: ['app.otherservice.de'] })(next)(event)

      expect(result).toEqual({
        headers: {
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
    })
  })

  describe('with an options request', () => {
    it('does not call the next middleware and returns early', () => {
      const next = jest.fn()
      const result = cors()(next)({ headers: { origin: 'app.service.de' }, httpMethod: 'OPTIONS' })

      expect(result).toEqual({
        headers: {
          'access-control-allow-origin': 'app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('with an async next middleware', () => {
    it('awaits the result and returns a promise as well', () => {
      const next = jest.fn().mockResolvedValue({ statusCode: 200 })
      const result = cors()(next)({ headers: { origin: 'app.service.de' }, httpMethod: 'GET' })

      expect(result).resolves.toEqual({
        headers: {
          'access-control-allow-origin': 'app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
    })
  })
})
