import express from 'express'

import db from '../src/db'

const router = express.Router()

router.get('/', (req, res, next) => {
  res.json({'a': 1})
})

export default router
