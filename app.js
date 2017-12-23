import express from 'express'
import morgan from 'morgan'

import feeds from './routes/feeds'
import schedule from './src/schedule'
import logStream from './utils/log-stream'

const app = express()

app.disable('x-powered-by')

app.use(morgan('combined', { stream: logStream('access') }))

app.use('/feeds', feeds)

schedule()

export default app
