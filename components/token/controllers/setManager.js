const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')
/**
 * @desc — getWeb3Address from `token`
 *
 * @return address
 */
module.exports = async function setManager(req, res) {
  console.log('in session')
  let session
  let mode
  try {
    /**
     *
     * @desc — get pin from req.body
     */
    let { pin, data={"name":"Mina Rezkallah"}} = req.body
    console.log("======> data",data)
    /**
     *
     * @desc — get pin from req.body
     */
    if (!pin) {
      return res.status(401).json({
        message: 'Error, Please Insert Pin And Data You Need To Store It',
      })
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
    var dataStoreIntoToken = data
    try{
    var oldisecSession = session
            .find({
            application: 'isec',
            label: 'data.MohamedHesham',
            })
            .items(0)
            .toType()
    if(oldisecSession){
        session.destroy(oldisecSession)
    }
    }catch(error){
        console.log("error ===========>",error)
    }
    const addressObject = session.create({
      class: graphene.ObjectClass.DATA,
      label: 'data.MohamedHesham',
      id: Buffer.from([1, 2, 3, 4, 5]),
      application: 'isec',
      token: true,
      modifiable: true,
      value: Buffer.from(JSON.stringify(dataStoreIntoToken)),
    })
    // console.log(JSON.parse(isecSession?.value?.toString()), 'isecSession')
    try {
      var isecSession = session
        .find({
          application: 'isec',
          label: 'data.MohamedHesham',
        })
        .items(0)
        .toType()
    } catch (error) {
      console.log(' error insert token...........', error)

      if (session) {
        session.close()
      }
      if (mode) {
        mode.finalize()
      }
      return res
        .status(400)
        .json({ message: 'This Data Not Found On This Token' })
    }
    console.log(
      'isec.........................',
      JSON.parse(isecSession.value.toString()),
      'isecSession',
    )
    //let address = JSON.parse(isecSession?.value?.toString())?.address
    let dataOnToken = JSON.parse(isecSession?.value?.toString())
    if (!isecSession) {
      return res.status(400).json({ token: 'no Private Key in this token' })
    }
    /**
     *
     *@desc —close session btw token & application
     */
    session.close()
    // session.logout()
    mode.finalize()
    
    return res.status(200).json({
      message: 'Data Inserted Into Token Successfully',
      dataOnToken
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
