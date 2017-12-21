import express from 'express'

import feeds from './routes/feeds'
import schedule from './src/schedule'

const app = express()

app.use('/feeds', feeds)

schedule()

export default app
