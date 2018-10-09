const express = require('express')
const app = express()

const RedisAccess = require('./src/redisAccess.js')
const redisAcccess = new RedisAccess()

const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 8080

app.use(morgan('dev'))
app.use(bodyParser.json())

app.post('/matchserver', async (req, res) => {
  // Put Matchserver details into redis
  let ip, count
  if (req.body.ip && req.body.playerCount) {
    [ip, count] = [req.body.ip, req.body.playerCount]
    const result = await redisAcccess.listPush(count + 'player', ip)
      .catch(err => {
        console.log(err)
        res.status(500).end()
      })
    res.json(result)
  } else {
    res.status(400).end()
  }
})

app.get('/joinmatch/:playerCount', async (req, res) => {
  if (req.params.playerCount) {
    // Pop Matchserver details from redis list
    let result = await redisAcccess.listPop(req.params.playerCount + 'player')
    if (result) {
      result = result.split(':')
      res.json({ 'ip': result[0], 'port': result[1] })
    } else {
      res.status(404).send('No match found')
    }
  } else {
    res.status(400).end()
  }
})

if (redisAcccess.init()) {
  app.listen(port, () => console.log(`App listening on port: ${port}`))
}
