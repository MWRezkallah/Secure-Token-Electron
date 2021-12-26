const checkTokenInserted = require('../shared/check.token')

/**
 * @desc — check if `token` inserted or not
 *
 * @return bool - success or failure
 */

module.exports = async function checkTokenApi(req, res) {
  try {
    let { message, inserted } = await checkTokenInserted()
    if (!inserted) {
      return res
        .status(201)
        .json({ message: 'device not insertd', m:message, inserted: false })
    }
    return res.status(200).json({ message: 'device insertd', inserted: true })
  } catch (error) {
    // if (mod) {
    //   mod.finalize()
    // }
    return res.status(400).json({ message: error })
  }
}
