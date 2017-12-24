import uuid from 'uuid/v4'
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
  return Object.keys(sources).map(async key => {
    const source = sources[key]
    let feeds = null

    try {
      feeds = await parser.fetchAsync(source.url)
      feeds.forEach(async feed => {
        if (feed.guid && feed.date) {
          const hashKey = 'feed:' + feed.guid
          const setKey = 'feed:timestamp'

          try {
            const isExists = await redis.exists(hashKey)
            if (!isExists) {
              redis.hmset(hashKey, {
                uuid: uuid(),
                source: JSON.stringify(source),
                feed: JSON.stringify(feed),
              })
            }
          } catch (e) {
            logger.error(e)
          }

          try {
            const result = await redis.zscore(setKey, feed.guid)
            if (!result) {
              redis.zadd(setKey, moment.utc(feed.date).valueOf(), feed.guid)
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
