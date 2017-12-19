import nodeSchedule from 'node-schedule'

import sync from './sync'

const schedule = () => {
  nodeSchedule.scheduleJob('0 * * * *', () => {
    console.log('SCHEDULE: Sync started at: ' + new Date().toString())
    sync()
  })
}

export default schedule
