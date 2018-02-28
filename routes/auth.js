import express from 'express'
import request from 'request'
import ioredis from 'ioredis'
import uuidv4 from 'uuid/v4'

const redis = new ioredis()

const router = express.Router()

router.post('/', (req, res, next) => {
  const { code } = req.body
  request(`https://api.weixin.qq.com/sns/jscode2session?appid=wx1edb7b0df8946e01&secret=77f08dcbc73dabbf24914f99d8fdeeab&js_code=${code}&grant_type=authorization_code`, (error, response) => {
    const body = JSON.parse(response.body)

    if (body.openid) {
      const sessionId = uuidv4()
      const sessionValue = body.openid + '|' + body.session_key

      redis.set(`session:${sessionId}`, sessionValue, 'EX', 24 * 3600)
      res.json(sessionId)
    } else {
      res.json(null)
    }
  })
})

export default router
