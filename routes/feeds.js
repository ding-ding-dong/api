import express from 'express'
import moment from 'moment'

import { getAll, getByTimestamp } from '../src/feeds'

const router = express.Router()

router.get('/', async (req, res, next) => {
  let feeds = null
  const date = req.query.date

  if (date) {
    const currentDateString = moment.utc(date).utcOffset('+0800').format('YYYYMMDD')
    const sDate = moment.utc(currentDateString).utcOffset('+0800').add(-8, 'hours').valueOf()
    const eDate = moment.utc(sDate).utcOffset('+0800').add(1, 'day').valueOf()
    feeds = await getByTimestamp(sDate, eDate)

    const key = req.query.key
    if (key) {
      feeds = feeds.filter(feed => feed.source.key === key)
    }
  } else {
    feeds = await getAll()
  }

  res.json(feeds)
})

export default router
