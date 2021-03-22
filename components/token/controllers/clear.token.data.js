const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')

/**
 * @desc — getWeb3Address from `token`
 *
 * @return address
 */
module.exports = async function clearTokenData(req, res) {
  console.log('in clear session')
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
    try {
      var isecSession = session
        .find({
          application: 'isec',
          label: 'data.pkaddress',
        })
        .items(0)
        .toType()
    } catch (error) {
      if (session) {
        session.close()
      }
      if (mode) {
        mode.finalize()
      }
      return res.status(400).json({ message: 'No Data On The Token' })
    }
    let tokenDataValues = JSON.parse(isecSession.value.toString())
    console.log('..isec session ....................', tokenDataValues)

    if (!tokenDataValues) {
      return res.status(400).json({ token: 'no Data in this token' })
    }

    let destSession = session.clear()
    console.log(' destSession ...', destSession)
    // let address = JSON.parse(isecSession?.value?.toString())?.address
    /**
     *
     *@desc —close session btw token & application
     */
    session.close()
    // session.logout()
    mode.finalize()
    return res
      .status(200)
      .json({ message: 'Data Deleated Sucessfully', tokenDataValues })
  } catch (error) {
    console.log(' error ...', error.nativeStack)

    if (session) {
      session.close()
    }
    if (mode) {
      mode.finalize()
    }
    return res.status(400).json({ message: error })
  }
}
