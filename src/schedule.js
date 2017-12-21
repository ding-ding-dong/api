import nodeSchedule from 'node-schedule'

import sync from './sync'

const schedule = () => {
  const cron = process.env.NODE_ENV === 'production' ? '0 * * * *' : '0 * * * * *'

  nodeSchedule.scheduleJob(cron, () => {
    console.log('SCHEDULE: Sync started at: ' + new Date().toString())
    sync()
  })
}

export default schedule
