const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')

/**
 * @desc — getUserPK
 *
 * @return pk
 */
module.exports = async function getUserPKAndAddress(req, res) {
  console.log('in session')
  let session
  let mode
  try {
    /**
     *
     * @desc — get pin from req.body
     */
    let { pin } = req.body
    /**
     *
     * @desc — check if token plugin or not using productId: 2055 && vendorId: 2414
     */
    let { message, inserted, mod } = await checkTokenInserted()
    if (!inserted) {
      return res.status(201).json({ message, inserted })
    }
    /**
     * @desc — USING FIRST SLOT
     *
     */
    mode = mod
    // mode.initialize()
    const slot = mode.getSlots(0)
    /**
     *
     * @desc — PREPARE SESSION TO OPEN && ADD PERMISSION RW_SESSION
     */
    session = slot.open(
      graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION,
    )
    /**
     *
     * @desc — OPEN SESSION WITH TOKEN USING PIN AND USER TYPE `USER`
     */
    session.login(pin, graphene.UserType.USER)
    /**
     *
     *@desc —get data from token using `label` & `application`
     */
    let isecSession = session
      .find({
        application: 'isec',
        label: 'data.pk',
      })
      .items(0)
      .toType()

    // console.log(JSON.parse(isecSession?.value?.toString()), 'isecSession')

    let address = JSON.parse(isecSession?.value?.toString())?.address
    let privateKey = JSON.parse(isecSession?.value?.toString())?.privateKey
    let phrase = JSON.parse(isecSession?.value?.toString())?.phrase

    if (!address) {
      return res.status(400).json({ token: 'no Private Key in this token' })
    }
    /**
     *
     *@desc —close session btw token & application
     */

    console.log(' address ...................', address)
    console.log(' privateKey ...................', privateKey)
    console.log(' phrase ...................', phrase)


    session.close()
    // session.logout()
    mode.finalize()

    return res.status(200).json({
      address,
      privateKey,
      phrase,
    })
  } catch (error) {
    if (session) {
      session.close()
    }
    if (mode) {
      mode.finalize()
    }
    return res.status(400).json({ message: error })
  }
}
