const isPromise = value => (
  value != null &&
    (typeof value === 'object' || typeof object === 'function') &&
    typeof value.then === 'function' &&
    typeof value.catch === 'function'
)

module.exports = isPromise
