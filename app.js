import express from 'express'

import api from './routes/api'
import schedule from './src/schedule'

const app = express()

app.use('/api', api)

app.use('/', (req, res) => {
  res.send('hi there')
})

schedule()

export default app
