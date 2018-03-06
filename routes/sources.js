import express from 'express'

import logger from '../utils/logger'
import parser from '../utils/parser'
import { getAll, add } from '../src/sources'

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.json(await getAll())
})

router.post('/', async (req, res, next) => {
  const { name, url } = req.body
  if (name && url) {
    try {
      const { description } = (await parser.fetchAsync(url)).meta
      res.json(await add({ name, url, description }))
    } catch (e) {
      logger.error(e)
      res.status(400).send({ error: 'Invalid RSS URL' })
    }
  } else {
    res.status(400).send({ error: 'Invalid request body' })
  }
})

export default router
