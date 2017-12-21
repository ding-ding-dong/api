import moment from 'moment'
import ioredis from 'ioredis'
import redisClientConfig from '../config/redis-client-config'

const redis = new ioredis(redisClientConfig)

const parse = item => ({ ...item, feed: item.feed ? JSON.parse(item.feed) : null })

export const getAll = async () => {
  try {
    const keys = await redis.keys('feed:http*')

    const promises = keys.map(async key => {
      try {
        const item = await redis.hgetall(key)
        return parse(item)
      } catch (e) {
        console.log(e, e.stack)
      }
    })

    try {
      return await Promise.all(promises)
    } catch (e) {
      console.log(e, e.stack)
    }
  } catch (e) {
    console.log(e, e.stack)
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
        console.log(e, e.stack)
      }
    })

    try {
      return await Promise.all(promises)
    } catch (e) {
      console.log(e, e.stack)
    }
  } catch (e) {
    console.log(e, e.stack)
  }
}
