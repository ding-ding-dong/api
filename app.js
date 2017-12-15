import express from 'express'

const app = express()

app.use('/', (req, res) => {
  res.send('hi there')
})

export default app
