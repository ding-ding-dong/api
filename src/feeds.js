import moment from 'moment'
import ioredis from 'ioredis'

import logger from '../utils/logger'

const redis = new ioredis()

const parse = item => ({
  ...item,
  source: item.source ? JSON.parse(item.source) : null,
  feed: item.feed ? JSON.parse(item.feed) : null,
})

export const getAll = async () => {
  try {
    const keys = await redis.keys('feed:http*')

    const promises = keys.map(async key => {
      try {
        const item = await redis.hgetall(key)
        return parse(item)
      } catch (e) {
        logger.error(e)
      }
    })

    try {
      return await Promise.all(promises)
    } catch (e) {
      logger.error(e)
    }
  } catch (e) {
    logger.error(e)
  }
}

export const getByTimestamp = async (sDate, eDate) => {
  try {
    const keys = await redis.zrangebyscore('feed:timestamp', sDate, eDate)

    const promises = keys.map(async key => {
      try {
        const item = await redis.hgetall('feed:' + key)
        return parse(item)
      } catch (e) {
        logger.error(e)
      }
    })

    try {
      return await Promise.all(promises)
    } catch (e) {
      logger.error(e)
    }
  } catch (e) {
    logger.error(e)
  }
}
