import uuid from 'uuid/v4'
import moment from 'moment'
import ioredis from 'ioredis'

import parser from '../utils/parser'
import redisClientConfig from '../config/redis-client-config'

const redis = new ioredis(redisClientConfig)

const sources = {
  '36kr': 'http://36kr.com/feed',
  'huxiu': 'https://www.huxiu.com/rss/0.xml',
  'ifanr': 'http://www.ifanr.com/feed',
  'tech2ipo': 'http://tech2ipo.com/feed',
  'hackernews': 'https://news.ycombinator.com/rss',
  'pmcaff': 'http://www.pmcaff.com/site/rss',
  'woshipm': 'http://www.woshipm.com/feed',
  'techcrunch': 'http://techcrunch.cn/feed/',
  'smzdm': 'http://post.smzdm.com/feed',
}

const state = {
  triedTimes: 1,
  maxCanTryTimes: 30,
  waitTime: 60 * 1000,
}

const generatePromises = () => {
  return Object.keys(sources).map(async key => {
    let feeds = null

    try {
      feeds = await parser.fetchAsync(sources[key])
      feeds.forEach(async feed => {
        if (feed.guid && feed.date) {
          const hashKey = 'feed:' + feed.guid
          const setKey = 'feed:timestamp'

          try {
            const isExists = await redis.exists(hashKey)
            if (!isExists) {
              redis.hmset(hashKey, {
                uuid: uuid(),
                source: key,
                feed: JSON.stringify(feed),
              })
            }
          } catch (e) {
            console.log(e, e.stack)
          }

          try {
            const result = await redis.zscore(setKey, feed.guid)
            if (!result) {
              redis.zadd(setKey, moment.utc(feed.date).valueOf(), feed.guid)
            }
          } catch (e) {
            console.log(e, e.stack)
          }
        }
      })
    } catch (e) {
      console.log('ERROR: Failed of fetching data from [' + sources[key] + ']')
      console.log(e, e.stack)
    }

    return feeds
  })
}

const sync = async () => {
  try {
    await Promise.all(generatePromises())

    console.log('SUCCESS: All sync tasks compeleted')
  } catch (e) {
    console.log(e, e.stack)

    if (state.triedTimes < state.maxCanTryTimes) {
      setTimeout(function () {
        state.triedTimes++
        console.log('INFO: Trying for the ' + state.triedTimes + 'th time')

        sync()
      }, state.waitTime)
    }
  }
}

export default sync