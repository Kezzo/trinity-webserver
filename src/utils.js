const splitAddress = addr => {
  const lastIndex = addr.lastIndexOf(':')
  const result = {
    ip: addr.substr(0, lastIndex),
    port: parseInt(addr.substr(lastIndex+1))
  }
  return result
}

module.exports = {
  splitAddress
}
