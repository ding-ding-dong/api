import uuidv5 from 'uuid/v5'
import moment from 'moment'
import ioredis from 'ioredis'

import parser from '../utils/parser'
import logger from '../utils/logger'
import sources from './sources'

const redis = new ioredis()

const state = {
  triedTimes: 1,
  maxCanTryTimes: 30,
  waitTime: 60 * 1000,
}

const generatePromises = () => {
  return sources.map(async source => {
    let feeds = null

    try {
      feeds = await parser.fetchAsync(source.url)
      feeds.forEach(async feed => {
        if (feed.guid && feed.date) {
          const uuid = uuidv5(feed.guid, uuidv5.URL)
          const hashKey = 'feed:uuid:' + uuid
          const setKey = 'feed:timestamp'

          try {
            const isExists = await redis.exists(hashKey)
            if (!isExists) {
              redis.hmset(hashKey, {
                uuid,
                source: JSON.stringify(source),
                feed: JSON.stringify(feed),
              })
            }
          } catch (e) {
            logger.error(e)
          }

          try {
            const result = await redis.zscore(setKey, uuid)
            if (!result) {
              redis.zadd(setKey, moment.utc(feed.date).valueOf(), uuid)
            }
          } catch (e) {
            logger.error(e)
          }
        }
      })
    } catch (e) {
      logger.error(e, 'ERROR: Failed of fetching data from [' + source.url + ']')
    }

    return feeds
  })
}

const sync = async () => {
  try {
    await Promise.all(generatePromises())

    logger.info('SUCCESS: All sync tasks compeleted')
  } catch (e) {
    logger.error(e)

    if (state.triedTimes < state.maxCanTryTimes) {
      setTimeout(function () {
        state.triedTimes++
        logger.info('FAILURE: Trying for the ' + state.triedTimes + '/' + state.maxCanTryTimes + 'th time')

        sync()
      }, state.waitTime)
    }
  }
}

export default sync
