const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')
const crypto = require('crypto')
/**
 *
 * @desc - get `public key`
 * @return public key hashed
 */

module.exports = async function getPublicKey(req, res) {
  let session
  let mode
  try {
    let { message, inserted, mod } = await checkTokenInserted()

    if (!inserted) {
      return res.status(400).json({ message })
    }
    /**
     *
     * @desc — get pin from req.body
     */
    let { pin  } = req.body
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
    // if (!session) {
    //   session.login(pin, graphene.UserType.USER)
    // }
    session.login(pin, graphene.UserType.USER)

    let publicKey = session
      .find({ class: graphene.ObjectClass.PUBLIC_KEY })
      .items(0)
      .toType()

    let data = publicKey.getAttribute('modulus').toString('base64')
    // let hashPk = crypto.createHash('md5').update(data).digest('hex')
    /**
     *
     *@desc —close session btw token & application
     */
    session.close()
    // session.logout()
    mode.finalize()

    return res.status(200).json({ publicKey: data })
  } catch (error) {
    console.log(error)
    if (session) {
      session.close()
    }
    if (mode) {
      mode.finalize()
    }
    return res.status(400).json({ message: error })
  }
}
