const rescueFrom = require('../rescueFrom')

describe('rescueFrom', () => {
  describe('without rescuing', () => {
    it('returns the result of the next middleware', () => {
      const event = {}
      const next = jest.fn().mockReturnValue(event)

      const result = rescueFrom()(next)(event)

      expect(result).toEqual(event)
      expect(next).toHaveBeenCalledWith(event)
    })

    it('returns the promise result of the next middleware', async () => {
      const event = {}
      const next = jest.fn().mockResolvedValue(event)

      return rescueFrom()(next)(event).then(result => {
        expect(result).toEqual(event)
        expect(next).toHaveBeenCalledWith(event)
      })
    })

    it('re-throws the exception', () => {
      const event = {}
      const error = new Error('Some Error')
      const next = jest.fn(() => { throw error })

      expect(() => { rescueFrom()(next)(event) }).toThrowError(error)
    })

    it('returns the rejected promise', async () => {
      const event = {}
      const error = new Error('Some Error')
      const next = jest.fn(async () => { throw error })

      expect(rescueFrom()(next)(event)).rejects.toThrowError(error)
    })
  })

  describe('with rescuing', () => {
    it('catches exceptions and returns the error handlers result', () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = new Error('Some Error')
      const next = jest.fn(() => { throw error })

      const result = rescueFrom([Error, errorHandler])(next)(event)

      expect(result).toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error, undefined)
    })

    it('catches rejected promises and returns the error handlers result', async () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = new Error('Some Error')
      const next = jest.fn(async () => { throw error })

      const result = rescueFrom([Error, errorHandler])(next)(event)

      await expect(result).resolves.toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error, expect.any(Promise))
    })

    it('catches all exceptions if exception class is left blank', () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = 'Some String Error'
      const next = jest.fn(() => { throw error })

      const result = rescueFrom([, errorHandler])(next)(event)

      expect(result).toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error, undefined)
    })

    describe('order of inherited exceptions', () => {
      describe('when the child exception is specified first', () => {
        it('catches the child exception', () => {
          class ChildError extends Error { }

          const event = {}
          const errorHandler = jest.fn().mockReturnValue('caught parent')
          const childErrorHandler = jest.fn().mockReturnValue('caught child')
          const error = new ChildError('Some Error')
          const next = jest.fn(() => { throw error })

          const result = rescueFrom(
            [ChildError, childErrorHandler],
            [Error, errorHandler]
          )(next)(event)

          expect(result).toEqual('caught child')
          expect(errorHandler).not.toHaveBeenCalled()
          expect(childErrorHandler).toHaveBeenCalledWith(error, undefined)
        })
      })

      describe('when the parent exception is specified first', () => {
        it('catches the parent exception', () => {
          class ChildError extends Error { }

          const event = {}
          const errorHandler = jest.fn().mockReturnValue('caught parent')
          const childErrorHandler = jest.fn().mockReturnValue('caught child')
          const error = new ChildError('Some Error')
          const next = jest.fn(() => { throw error })

          const result = rescueFrom(
            [Error, errorHandler],
            [ChildError, childErrorHandler]
          )(next)(event)

          expect(result).toEqual('caught parent')
          expect(childErrorHandler).not.toHaveBeenCalled()
          expect(errorHandler).toHaveBeenCalledWith(error, undefined)
        })
      })
    })
  })
})
