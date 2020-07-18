const createLambdaHandler = require('./createLambdaHandler')
const cors = require('./middlewares/cors')
const rescueFrom = require('./middlewares/rescueFrom')

module.exports = { cors, createLambdaHandler, rescueFrom }
