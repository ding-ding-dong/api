#!/usr/bin/env node

import http from 'http'
import debugModule from 'debug'

import app from '../app.js'

const debug = debugModule('api:server')

const onError = error => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + addr.address + ' ' + bind)
}

const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? '80' : '3000')
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : undefined

app.set('port', port)

const server = http.createServer(app)

server.listen(port, hostname)
server.on('error', onError)
server.on('listening', onListening)
