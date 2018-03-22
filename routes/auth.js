import express from 'express'
import request from 'request'
import ioredis from 'ioredis'
import uuidv4 from 'uuid/v4'

const redis = new ioredis()

const router = express.Router()

router.post('/', (req, res, next) => {
  const { code } = req.body

  request(`https://api.weixin.qq.com/sns/jscode2session?appid=wx930971a1fbe9a8c6&secret=cc1eadd023fdb326d2d53c232f9b3ef3&js_code=${code}&grant_type=authorization_code`, (error, response) => {
    const body = JSON.parse(response.body)

    if (body.openid) {
      const sessionId = uuidv4()
      const sessionValue = body.openid + '|' + body.session_key

      redis.set(`session:${sessionId}`, sessionValue, 'EX', 3600)
      res.json(sessionId)
    } else {
      res.json(null)
    }
  })
})

router.get('/', async (req, res, next) => {
  const { sessionId } = req.query
  const sessionValue = await redis.get(`session:${sessionId}`)

  res.json(!!sessionValue)
})

export default router
