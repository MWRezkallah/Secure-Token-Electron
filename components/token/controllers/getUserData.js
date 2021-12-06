const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')
const NodeRSA = require('node-rsa')
const fs = require('fs')
//const publicKey = fs.readFileSync('public_key', 'utf8')
/**
 * @desc — getUserPK
 *
 * @return pk
 */
module.exports = async function getUserData(req, res) {
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
     * @desc — check if not pin return error
     */
    if (!pin) {
      return res.status(401).json({ message: 'Error, Please Insert Pin' })
    }
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
        label: 'data.pkaddress',
      })
      .items(0)
      .toType()

    console.log(JSON.parse(isecSession?.value?.toString()), 'isecSession')

    let address = JSON.parse(isecSession?.value?.toString())?.address
    let privateKey = JSON.parse(isecSession?.value?.toString())?.privateKey
    if (!(address || privateKey)) {
      return res
        .status(400)
        .json({ token: 'No Private Key Or Address in this token' })
    }
    /**
     *
     *@desc —close session btw token & application
     */

    //console.log(' address ...................', address)
    //console.log(' privateKey ...................', privateKey)

    const key = new NodeRSA().importKey(`-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7q2YTdNLNKNIzArrlAS/
    Is1IoMEluu8BIXkI4faNkSO62aLJCLisU0Mfp94cGBS3YLI8D852gRZF84fxn7pV
    gZ6YBLbnWWLYmbWoZElP1AzRUuHw7p9+iiokxP0TF0wHmvK0qULwOFLm6eQGUDA+
    qz1TxMR9+CWoUZvlT95tCM1xj+tdcCC+0CD5o54YUd9Zmisigi92dgcg2wBaQyZ1
    x03llJ7qbZw+5VVMcvgwdR5CUCD7U0k+2yJRzLDCHQy/+WAfiJRy0nZBtCAkyKPU
    M9sHr4qvxpSDvvWFA+ofOLv4x7CzRD3w9YGI+ker4g+StXkOrk0RHgBr+6OhfQm9
    /wIDAQAB
    -----END PUBLIC KEY-----`)
    let user_data = await key.encrypt(
      {
        address,
        privateKey,
      },
      'base64',
    )

    session.close()
    // session.logout()
    mode.finalize()

    return res.status(200).json({
      address,
      user_data,
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
