const graphene = require('graphene-pk11')
const checkTokenInserted = require('../shared/check.token')
const asn1 = require('asn1js')
const pkijs = require('pkijs')
const pvutils = require('pvutils')
const fs = require('fs')
// const fsPromises = fs.promises
const path = require('path')
const fetch = require('node-fetch')

/**
 * @desc — check `cer` valid or not
 *
 * @return bool - success or failure
 */
module.exports = async function checkCer(req, res) {
  let session
  let mode
  try {
    /**
     *
     * @desc — get pin from req.body
     */
    let { pin = '11112222' } = req.body
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
     *@desc —get cert from token using `class`
     */
    const certificates = session.find({
      class: graphene.ObjectClass.CERTIFICATE,
    })

    const cert = certificates.items(0).toType()

    if (cert instanceof graphene.X509Certificate) {
      console.log('Certificate info:\n===========================')
      console.log('serialNumber', cert.serialNumber)
      console.log('trusted', cert.trusted)
        // console.log('checkValue', cert.checkValue)
        // console.log('url', cert.url)
        // console.log('startDate', cert.startDate)
        // console.log('End Date', cert.endDate ? cert.endDate : 'null')
        // console.log('Handle:', cert.handle.toString('hex'))
        // console.log('ID:', cert.id.toString('hex'))
        // console.log('Label:', cert.label)
        // console.log('category:', graphene.CterificateCategory[cert.category])
        // console.log('Subject:', cert.subject.toString('hex'))
        // console.log('Issuer:', cert.issuer.toString('hex'))
        // console.log('Value:', cert.value.toString('hex'))
    }

    // if (!isecSession) {
    //   return res
    //     .status(400)
    //     .json({ token: 'this token not belong to this app' })
    // }

    const url =
      'http://mpkicrl.egypttrust.com/EgyptTrustCorporateCAG3/LatestCRL.crl'

    const response = await fetch(url)

    const responseBuffer = await response.buffer()

    let productionPath = path.join(
      process.resourcesPath,
      'lib',
      'LatestCRL.crl',
    )

    let devPath = path.join(__dirname, '../../../lib/LatestCRL.crl')
    // let certs = fs.readFileSync(devPath)
    let certs = responseBuffer

    // How to parse Certificate Revocation List (CRL)

    const certBuffer = new Uint8Array(certs).buffer
    const asn1crl = asn1.fromBER(certBuffer)
    const crl = new pkijs.CertificateRevocationList({
      schema: asn1crl.result,
    })
    let serialNumbers = []

    for (const { userCertificate } of crl.revokedCertificates) {
      serialNumbers.push(
        pvutils.bufferToHexCodes(userCertificate.valueBlock.valueHex),
      )
    }

    for (let i = 0; i < serialNumbers.length; i++) {
      if (serialNumbers[i] === cert.serialNumber) {
        return res
          .status(200)
          .json({ message: 'this.revokedCertificates', certificate: false })
      }
    }
    /**
     *
     *@desc —close session btw token & application
     */
    session.close()
    // session.logout()
    mode.finalize()

    return res
      .status(200)
      .json({ message: 'this.validCertificates', certificate: true })
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
