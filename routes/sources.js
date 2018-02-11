import express from 'express'

import logger from '../utils/logger'
import { getAll, add, isValid } from '../src/sources'

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.json(await getAll())
})

router.post('/', async (req, res, next) => {
  const { name, url } = req.body
  if (name && url) {
    try {
      if (await isValid({ url })) {
        res.json(await add({ name, url }))
      } else {
        res.status(400).send({ error: 'Invalid RSS URL' })
      }
    } catch (e) {
      logger.error(e)
    }
  } else {
    res.status(400).send({ error: 'Invalid request body' })
  }
})

export default router
