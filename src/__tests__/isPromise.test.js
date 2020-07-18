const isPromise = require('../isPromise')

describe('isPromise', () => {
  it('returns true for objects with a promise interface', () => {
    expect(isPromise(new Promise(resolve => {}))).toBe(true)
    expect(isPromise(Promise.resolve())).toBe(true)
    expect(isPromise({ catch: () => {}, then: () => {} })).toBe(true)
  })

  it('returns false for everything else', () => {
    expect(isPromise(null)).toBe(false)
    expect(isPromise(undefined)).toBe(false)
    expect(isPromise(1)).toBe(false)
    expect(isPromise('String')).toBe(false)
    expect(isPromise({ then: () => {}, catch: 'no function' })).toBe(false)
    expect(isPromise({ then: 'no function', catch: () => {} })).toBe(false)
    expect(isPromise([])).toBe(false)
  })
})
