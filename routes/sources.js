import express from 'express'

import sources from '../src/sources'

const router = express.Router()

router.get('/', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')

  res.json(sources)
})

export default router
