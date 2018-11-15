const splitAddress = addr => {
  const lastIndex = addr.lastIndexOf(':')
  const tail = addr.substr(lastIndex + 1).split('@')
  const result = {
    ip: addr.substr(0, lastIndex),
    port: parseInt(tail[0]),
    containerID: tail[1]
  }
  return result
}

module.exports = {
  splitAddress
}
