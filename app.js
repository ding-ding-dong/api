import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'

import sources from './routes/sources'
import feeds from './routes/feeds'
import auth from './routes/auth'
import subscriptions from './routes/subscriptions'
import schedule from './src/schedule'
import logStream from './utils/log-stream'

const app = express()

app.disable('x-powered-by')

app.use(morgan('combined', { stream: logStream('access') }))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', '*')
  next()
})

app.use('/api/sources', sources)
app.use('/api/feeds', feeds)
app.use('/api/auth', auth)
app.use('/api/subscriptions', subscriptions)

schedule()

export default app
