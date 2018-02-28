import express from 'express'
import ioredis from 'ioredis'

import logger from '../utils/logger'

const redis = new ioredis()

const router = express.Router()

router.post('/', async (req, res, next) => {
  const { sessionId, sourceKey } = req.body
  const sessionValue = await redis.get(`session:${sessionId}`)

  if (sessionValue) {
    try {
      const openId = sessionValue.split('|')[0]
      const setKey = `subscription:${openId}:`

      res.json(await redis.sadd(setKey, sourceKey))
    } catch (e) {
      logger.error(e)
    }
  } else {
    res.json(null)
  }
})

router.get('/', async (req, res, next) => {
  const { sessionId } = req.query
  const sessionValue = await redis.get(`session:${sessionId}`)

  if (sessionValue) {
    try {
      const openId = sessionValue.split('|')[0]
      const setKey = `subscription:${openId}:`

      res.json(await redis.smembers(setKey))
    } catch (e) {
      logger.error(e)
    }
  } else {
    res.json(null)
  }
})

router.delete('/', async (req, res, next) => {
  const { sessionId, sourceKey } = req.body
  const sessionValue = await redis.get(`session:${sessionId}`)

  if (sessionValue) {
    try {
      const openId = sessionValue.split('|')[0]
      const setKey = `subscription:${openId}:`

      res.json(await redis.srem(setKey, sourceKey))
    } catch (e) {
      logger.error(e)
    }
  } else {
    res.json(null)
  }
})

export default router
