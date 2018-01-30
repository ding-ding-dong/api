import express from 'express'
import moment from 'moment'

import { getAll, getByTimestamp, getByUuid } from '../src/feeds'

const router = express.Router()

router.get('/', async (req, res, next) => {
  let feeds = null
  const date = req.query.date
  const page = req.query.page

  if (date) {
    const sDate = Number(date)
    const eDate = moment(sDate).add(1, 'day').valueOf()
    feeds = await getByTimestamp(sDate, eDate)

    const key = req.query.key
    if (key) {
      feeds = feeds.filter(feed => feed.source.key === key)
    }
  } else {
    feeds = await getAll()
  }

  feeds = feeds.sort((a, b) => moment(b.feed.date).valueOf() - moment(a.feed.date).valueOf())

  const pageSize = 20
  feeds = page ? feeds.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : feeds

  res.json(feeds)
})

router.get('/:uuid', async (req, res, next) => {
  res.json(await getByUuid(req.params.uuid))
})

export default router
