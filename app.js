import express from 'express'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import rfs from 'rotating-file-stream'

import feeds from './routes/feeds'
import schedule from './src/schedule'

const app = express()

app.disable('x-powered-by')

const logDirectory = path.join(path.resolve(path.dirname('')), './log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
})
app.use(morgan('combined', { stream: accessLogStream }))

app.use('/feeds', feeds)

schedule()

export default app
