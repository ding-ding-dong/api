import fs from 'fs'
import path from 'path'
import rfs from 'rotating-file-stream'

const logDirectory = path.join(path.resolve(path.dirname('')), './log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const logStream = filename => {
  return rfs(`${filename}.log`, {
    interval: '1d',
    path: logDirectory,
  })
}

export default logStream
