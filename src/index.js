const express = require('express')
const app = express()

const RedisAccess = require('./redisAccess')
const redisAcccess = new RedisAccess(process.env.REDIS_ENDPOINT)

const { splitAddress } = require('./utils')

const listenPort = 3075

const middleware = require('./middleware')

app.use(middleware)

app.get('/', (req, res) => {
  res.status(200).send('Moin!')
})

app.post('/matchserver', async (req, res) => {
  // Put Matchserver details into redis
  if (req.body.addr) {
    console.log('Received: ', req.body)
    const availableServers = await Promise.all([redisAcccess.getlistlength(1 + 'player'), redisAcccess.getlistlength(2 + 'player')])
      .catch(err => {
        console.log(err)
        res.status(500).end()
      })

    console.log('Found ', availableServers[0] + ' 1-player-servers and ', availableServers[1], ' 1-player-servers')
    const requiredPlayerCount = availableServers[0] < availableServers[1] ? 1 : 2

    const listPushsToAwait = []
    for (let i = requiredPlayerCount; i > 0; i--) {
      console.log('PUSH', requiredPlayerCount + 'player', req.body.addr)
      listPushsToAwait.push(redisAcccess.listPush(requiredPlayerCount + 'player', req.body.addr))
    }

    const pushResults = await Promise.all(listPushsToAwait)
      .catch(err => {
        console.log(err)
        res.status(500).end()
      })

    var responseData = Buffer.from([requiredPlayerCount])
    res.write(responseData)
    res.end()
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
  console.log('1Player matches: ' + result1Player)
  console.log('2Players matches: ' + result2Player)
  res.json({
    '1Player': result1Player,
    '2Players': result2Player
  })
})

if (redisAcccess.init()) {
  app.listen(listenPort, () => console.log(`App listening on port: ${listenPort}`))
}
