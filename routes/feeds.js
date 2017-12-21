import express from 'express'
import moment from 'moment'

import { getAll, getByTimestamp } from '../src/feeds'

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.json(await getAll())
})

router.get('/:date', async (req, res, next) => {
  const date = req.params.date
  const currentDateString = moment.utc(date).utcOffset('+0800').format('YYYYMMDD')
  const eDate = moment.utc(currentDateString).add(-8, 'hours').valueOf()
  const sDate = moment.utc(eDate).add(-1, 'day').valueOf()

  res.json(await getByTimestamp(sDate, eDate))
})

export default router
