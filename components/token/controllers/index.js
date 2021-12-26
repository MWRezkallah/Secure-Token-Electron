const login = require('./token.login')
const checkTokenApi = require('./token.check.if.inserted')
const getPublicKey = require('./token.send.publicKey')
const checkCer = require('./token.check.cer')
const getWeb3Address = require('./token.getWeb3Address')
const getAddress = require('./token.getAddress')
const getUserPKAndAddress = require('./token.getPkAndAddress')
const getUserData = require('./getUserData')
const setInToken = require('./setInToken')
const clearTokenData = require('./clear.token.data')
const setManager = require("./setManager")
const getManager = require("./getManager")

module.exports = {
  login,
  checkTokenApi,
  getPublicKey,
  checkCer,
  getWeb3Address,
  getAddress,
  getUserPKAndAddress,
  getUserData,
  setInToken,
  clearTokenData,
  setManager,
  getManager
}
