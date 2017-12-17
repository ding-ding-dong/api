import express from 'express'

import api from './routes/api'

const app = express()

app.use('/api', api)

app.use('/', (req, res) => {
  res.send('hi there')
})

export default app
