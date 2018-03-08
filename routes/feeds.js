import express from 'express'
import moment from 'moment'
import ioredis from 'ioredis'

import { getAll, getByTimestamp, getByUuid } from '../src/feeds'

const redis = new ioredis()
const router = express.Router()

const filter = ({ feeds, subscriptions }) => feeds.filter(feed => subscriptions.find(subscription => subscription === feed.source.key))

router.get('/', async (req, res, next) => {
  const { date, page, key, sessionId } = req.query
  const sessionValue = await redis.get(`session:${sessionId}`)

  if (sessionValue) {
    try {
      let feeds = []

      const openId = sessionValue.split('|')[0]
      const setKey = `subscription:${openId}:`

      if (date) {
        let sDate = Number(date)
        const eDate = moment(sDate).add(1, 'day').valueOf()

        if (key) {
          sDate = moment(sDate).add(-30, 'day').valueOf()
        }
        feeds = await getByTimestamp(sDate, eDate)

        if (key) {
          feeds = feeds.filter(feed => feed.source.key === key)
        } else {
          const subscriptions = await redis.smembers(setKey)
          feeds = filter({ feeds, subscriptions })
        }
      }

      feeds = feeds.sort((a, b) => moment(b.feed.date).valueOf() - moment(a.feed.date).valueOf())

      const pageSize = 20
      feeds = page ? feeds.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : feeds

      res.json(feeds)
    } catch (e) {
      logger.error(e)
      res.json([])
    }
  } else {
    res.json([])
  }
})

router.get('/:uuid', async (req, res, next) => {
  res.json(await getByUuid(req.params.uuid))
})

export default router
