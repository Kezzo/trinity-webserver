const express = require('express')
const app = express()

const RedisAccess = require('./src/redisAccess.js')
const redisAcccess = new RedisAccess()

const morgan = require('morgan')
const port = process.env.PORT || 8080

app.use(morgan('dev'))

app.get('/matchserver', async (req, res) => {
  // Put Matchserver details into redis
  const result = await redisAcccess.listPush('1player', '127.0.0.1:2448')
  console.log(result)
  res.json(result)
})

app.get('/joinmatch', async (req, res) => {
  let result = await redisAcccess.listPop('1player')
  result = result.split(':')
  // Pop Matchserver details from redis
  res.json({ 'IP': result[0], 'PORT': result[1] })
})

if (redisAcccess.init()) {
  app.listen(port, () => console.log(`App listening on port: ${port}`))
}
