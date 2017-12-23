import bunyan from 'bunyan'
import logStream from '../utils/log-stream'

let streams = [{
  level: 'info',
  stream: logStream('info'),
}]

if (process.env.NODE_ENV !== 'production') {
  streams = streams.concat({
    level: 'info',
    stream: process.stdout,
  })
}

const logger = bunyan.createLogger({
  name: 'ding-ding-dong-api',
  streams,
})

export default logger
