import moment from 'moment'
import ioredis from 'ioredis'
import sanitizeHtml from 'sanitize-html'

import logger from '../utils/logger'

const redis = new ioredis()

const parse = item => ({
  ...item,
  source: item.source ? JSON.parse(item.source) : null,
  feed: item.feed ? JSON.parse(item.feed) : null,
})

const filter = item => ({
  ...item,
  feed: {
    title: item.feed.title,
    description: item.feed.description,
    date: item.feed.date,
  },
})

const sanitize = item => ({
  ...item,
  feed: {
    ...item.feed,
    description: sanitizeHtml(item.feed.description, {
      allowedTags: [],
      allowedAttributes: {}
    }).slice(0, 200),
  },
})

export const getAll = async () => {
  try {
    const keys = await redis.keys('feed:uuid:*')

    const promises = keys.map(async key => {
      try {
        const item = await redis.hgetall(key)
        return sanitize(filter(parse(item)))
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
        const item = await redis.hgetall('feed:uuid:' + key)
        return sanitize(filter(parse(item)))
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

export const getByUuid = async uuid => {
  try {
    const item = await redis.hgetall('feed:uuid:' + uuid)
    return filter(parse(item))
  } catch (e) {
    logger.error(e)
  }
}
