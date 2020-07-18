const cors = require('../cors')
const createLambdaHandler = require('../../createLambdaHandler')

describe('cors', () => {
  describe('with no explicit origins whitelisted', () => {
    it('whitelists all origins', () => {
      const event = { headers: { origin: 'app.service.de' }, httpMethod: 'GET' }
      const next = jest.fn().mockReturnValue({ statusCode: 200, body: 'value' })
      const result = cors()(next)(event)

      expect(result).resolves.toEqual({
        body: 'value',
        headers: {
          'access-control-allow-headers': '*',
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

      expect(result).resolves.toEqual({
        headers: {
          'access-control-allow-headers': '*',
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

      expect(result).resolves.toEqual({
        headers: {
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
    })

    describe('with prefixed origins', () => {
      it('allows https prefixed origins', () => {
        const event = { headers: { origin: 'https://app.service.de' }, httpMethod: 'GET' }
        const next = jest.fn().mockReturnValue({ statusCode: 200 })
        const result = cors({ origins: ['app.service.de'] })(next)(event)

        expect(result).resolves.toEqual({
          headers: {
            'access-control-allow-headers': '*',
            'access-control-allow-origin': 'https://app.service.de',
            'access-control-allow-methods': 'GET,OPTIONS,POST'
          },
          statusCode: 200
        })
      })

      it('allows http prefixed origins', () => {
        const event = { headers: { origin: 'http://app.service.de' }, httpMethod: 'GET' }
        const next = jest.fn().mockReturnValue({ statusCode: 200 })
        const result = cors({ origins: ['app.service.de'] })(next)(event)

        expect(result).resolves.toEqual({
          headers: {
            'access-control-allow-headers': '*',
            'access-control-allow-origin': 'http://app.service.de',
            'access-control-allow-methods': 'GET,OPTIONS,POST'
          },
          statusCode: 200
        })
      })

      it('does not allow other prefixes', () => {
        const event = { headers: { origin: 'http2://app.service.de' }, httpMethod: 'GET' }
        const next = jest.fn().mockReturnValue({ statusCode: 200 })
        const result = cors({ origins: ['app.service.de'] })(next)(event)

        expect(result).resolves.toEqual({
          headers: {
            'access-control-allow-headers': '*',
            'access-control-allow-methods': 'GET,OPTIONS,POST'
          },
          statusCode: 200
        })
      })
    })
  })

  describe('with an options request', () => {
    it('does not call the next middleware and returns early', () => {
      const next = jest.fn()
      const result = cors()(next)({ headers: { origin: 'app.service.de' }, httpMethod: 'OPTIONS' })

      expect(result).resolves.toEqual({
        headers: {
          'access-control-allow-headers': '*',
          'access-control-allow-origin': 'app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('with whitelisted headers', () => {
    it('allows the headers', () => {
      const event = { headers: { origin: 'http://app.service.de' }, httpMethod: 'GET' }
      const next = jest.fn().mockReturnValue({ statusCode: 200 })
      const result = cors({ headers: ['Authorization', 'Content-Type'], origins: ['app.service.de'] })(next)(event)

      expect(result).resolves.toEqual({
        headers: {
          'access-control-allow-headers': 'Authorization,Content-Type',
          'access-control-allow-origin': 'http://app.service.de',
          'access-control-allow-methods': 'GET,OPTIONS,POST'
        },
        statusCode: 200
      })
    })
  })
})
