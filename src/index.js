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

app.get('/joinmatch/:playerCount', async (req, res) => {
  if (req.params.playerCount) {
    // Pop Matchserver details from redis list
    let result = await redisAcccess.listPop(req.params.playerCount + 'player')
    if (result) {
      const splitted = splitAddress(result)
      const matchserver = await redisAcccess.key('*')
      if (matchserver.includes(splitted.containerID)) {
        const serverAddr = {
          IP: splitted.ip,
          Port: splitted.port,
          ContainerID: splitted.containerID
        }
        console.log(serverAddr)
        res.json(serverAddr)
      } else {
        res.status(404).send('No match found - Please try it again')
      }
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

app.get('/matchserver', async (req, res) => {
  const result = await redisAcccess.key('*')
  res.json(result)
})

if (redisAcccess.init()) {
  app.listen(listenPort, () => console.log(`App listening on port: ${listenPort}`))
}
