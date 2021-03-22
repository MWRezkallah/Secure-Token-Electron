const express = require('express')
const {
  login,
  checkTokenApi,
  getPublicKey,
  checkCer,
  getWeb3Address,
  getUserData,
  getAddress,
  getUserPKAndAddress,
  setInToken,
  clearTokenData
} = require('./controllers')

const router = express.Router()

router.post('/token/check', checkTokenApi)
router.post('/token/login', login)
router.post('/token/get-public-key', getPublicKey)
router.post('/token/check-cer', checkCer)
router.post('/token/get-web3-address', getWeb3Address)
router.post('/token/get-user-data', getUserData)
router.post('/token/get-address', getAddress)
router.post('token/get-pk-and-address', getUserPKAndAddress)
router.post('/token/set-user-token', setInToken)
router.post('/token/clear-token-data', clearTokenData)


module.exports = router
