const splitAddress = addr => {
  const lastIndex = addr.lastIndexOf(':')
  const result = {
    'ip': addr.substr(0, lastIndex),
    'port': addr.substr(lastIndex)
  }
  return result
}

module.exports = {
  splitAddress
}
