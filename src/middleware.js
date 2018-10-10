const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const router = express.Router()

router.use(morgan('dev'))
router.use(bodyParser.json())
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST')
  res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,ip,playerCount')
  next()
})

module.exports = router
