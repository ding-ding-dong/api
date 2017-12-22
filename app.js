import express from 'express'

import feeds from './routes/feeds'
import schedule from './src/schedule'

const app = express()

app.disable('x-powered-by')

app.use('/feeds', feeds)

schedule()

export default app
