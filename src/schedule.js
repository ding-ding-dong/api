import nodeSchedule from 'node-schedule'

import sync from './sync'
import logger from '../utils/logger'

const schedule = () => {
  const cron = process.env.NODE_ENV === 'production' ? '*/2 * * * * *' : '0 * * * * *'

  nodeSchedule.scheduleJob(cron, () => {
    logger.info('SCHEDULE: Sync started at: ' + new Date().toString())
    sync()
  })
}

export default schedule
