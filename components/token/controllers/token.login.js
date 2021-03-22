const { session } = require('electron')
const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')

/**
 * @desc — login with `token`
 *
 * @return bool - success or failure
 */
module.exports = async function login(req, res) {
  let session;
  let mode;
  try {
    /**
     *
     * @desc — get pin from req.body
     */
    let { pin  } = req.body
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
    // let isecSession = session
    //   .find({
    //     application: 'ISEC',
    //     label: 'data.address',
    //   })
    //   .items(0)
    //   .toType()

    // if (!isecSession) {
    //   return res
    //     .status(400)
    //     .json({ token: 'this token not belong to this app' })
    // }
    /**
     *
     *@desc —close session btw token & application
     */
    session.close()
    // session.logout()
    mode.finalize()

    return res.status(200).json({ message: 'pin correct' })
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
