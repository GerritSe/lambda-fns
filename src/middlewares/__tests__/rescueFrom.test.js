const rescueFrom = require('../rescueFrom')

describe('rescueFrom', () => {
  describe('without rescuing', () => {
    it('returns the result of the next middleware', () => {
      const event = {}
      const next = jest.fn().mockReturnValue(event)

      const result = rescueFrom()(next)(event)

      expect(result).resolves.toEqual(event)
      expect(next).toHaveBeenCalledWith(event)
    })

    it('re-throws the exception', async () => {
      const event = {}
      const error = new Error('Some Error')
      const next = jest.fn(() => { throw error })

      await expect(rescueFrom()(next)(event)).rejects.toEqual(error)
    })

    it('returns the rejected promise', async () => {
      const event = {}
      const error = new Error('Some Error')
      const next = jest.fn(async () => { throw error })

      expect(rescueFrom()(next)(event)).rejects.toThrowError(error)
    })
  })

  describe('with rescuing', () => {
    it('catches exceptions and returns the error handlers result', async () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = new Error('Some Error')
      const next = jest.fn(() => { throw error })

      const result = rescueFrom([Error, errorHandler])(next)(event)

      await expect(result).resolves.toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error)
    })

    it('catches rejected promises and returns the error handlers result', async () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = new Error('Some Error')
      const next = jest.fn(async () => { throw error })

      const result = rescueFrom([Error, errorHandler])(next)(event)

      await expect(result).resolves.toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error)
    })

    it('catches all exceptions if exception class is left blank', async () => {
      const event = {}
      const errorHandler = jest.fn().mockReturnValue('caught')
      const error = 'Some String Error'
      const next = jest.fn(() => { throw error })

      const result = rescueFrom([, errorHandler])(next)(event)

      await expect(result).resolves.toEqual('caught')
      expect(errorHandler).toHaveBeenCalledWith(error)
    })

    describe('order of inherited exceptions', () => {
      describe('when the child exception is specified first', () => {
        it('catches the child exception', async () => {
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

          await expect(result).resolves.toEqual('caught child')
          expect(errorHandler).not.toHaveBeenCalled()
          expect(childErrorHandler).toHaveBeenCalledWith(error)
        })
      })

      describe('when the parent exception is specified first', () => {
        it('catches the parent exception', async () => {
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

          await expect(result).resolves.toEqual('caught parent')
          expect(childErrorHandler).not.toHaveBeenCalled()
          expect(errorHandler).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
