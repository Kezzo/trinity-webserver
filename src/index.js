const express = require('express')
const app = express()

const RedisAccess = require('./redisAccess')
const redisAcccess = new RedisAccess(process.env.REDIS_ENDPOINT)

const { splitAddress } = require('./utils')

const port = process.env.PORT || 8080

const middleware = require('./middleware')

app.use(middleware)

app.get('/', (req, res) => {
  res.status(200).send('Moin!')
})

app.post('/matchserver', async (req, res) => {
  // Put Matchserver details into redis
  let port, count, ip
  if (req.body.port && req.body.playerCount) {
    [port, count, ip] = [
      req.body.port.split(':')[3],
      req.body.playerCount,
      req.connection.remoteAddress.split(':')[3] || req.connection.remoteAddress
    ]
    console.log(port, count, ip)
    let result = []
    for (let i = count; i > 0; i--) {
      console.log('PUSH', count + 'player', ip + ':' + port)
      const res = await redisAcccess.listPush(count + 'player', ip + ':' + port)
        .catch(err => {
          console.log(err)
          res.status(500).end()
        })
      result.push(res)
    }
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
      const splitted = splitAddress(result)
      const serverAddr = { IP: splitted.ip, Port: splitted.port }
      console.log(serverAddr)
      res.json(serverAddr)
    } else {
      res.status(404).send('No match found')
    }
  } else {
    res.status(400).end()
  }
})

app.get('/matchserverlist', async (req, res) => {
  // Get one player and two player match lists
  const result1Player = await redisAcccess.getlist(1 + 'player')
  const result2Player = await redisAcccess.getlist(2 + 'player')
  console.log("1Player matches: " + result1Player)
  console.log("2Players matches: " + result2Player)
  res.json({
    '1Player': result1Player,
    '2Players': result2Player,
  })
})

if (redisAcccess.init()) {
  app.listen(port, () => console.log(`App listening on port: ${port}`))
}
