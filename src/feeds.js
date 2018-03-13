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

const purge = markups => markups.replace(/<article>/g, '').replace(/<\/article>/g, '')

const filter = item => ({
  ...item,
  feed: {
    title: item.feed.title,
    description: item.feed.description ? purge(item.feed.description) : '',
    date: item.feed.date,
  },
})

const getImageTags = markups => markups.match(/<img([\w\W]+?)[\/]?>/g) || []

const getImages = imageTags => imageTags.map(imageTag => imageTag.match(/src=['"](.*?)['"]/)[1])

const append = item => ({
  ...item,
  feed: {
    ...item.feed,
    images: getImages(getImageTags(item.feed.description).slice(0, 3))
  }
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

const safeSanitize = item => ({
  ...item,
  feed: {
    ...item.feed,
    description: sanitizeHtml(item.feed.description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        img: ['src']
      }
    }),
  },
})

export const getAll = async () => {
  try {
    const keys = await redis.keys('feed:uuid:*')

    const promises = keys.map(async key => {
      try {
        const item = await redis.hgetall(key)
        return sanitize(append(filter(parse(item))))
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
        return sanitize(append(filter(parse(item))))
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
    return safeSanitize(filter(parse(item)))
  } catch (e) {
    logger.error(e)
  }
}
