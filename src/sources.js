import ioredis from 'ioredis'
import uuidv5 from 'uuid/v5'

import logger from '../utils/logger'

const redis = new ioredis()

export const getAll = async () => {
  try {
    const keys = await redis.keys('source:uuid:*')
  
    const promises = keys.map(async key => {
      try {
        return await redis.hgetall(key)
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

export const add = async ({ name, url, description }) => {
  if (name && url) {
    const uuid = uuidv5(url, uuidv5.URL)
    const hashKey = 'source:uuid:' + uuid

    try {
      const source = { key: uuid, name, url, description }
      const isExists = await redis.exists(hashKey)

      if (!isExists) {
        redis.hmset(hashKey, source)
      }

      return source
    } catch (e) {
      logger.error(e)
    }
  }
}
