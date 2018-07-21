const express = require('express')
const app = express()
const uport = require('uport')
const EmailVerifier = require('uport-verify-email').default
const bodyParser = require('body-parser')
const jwtDecode = require('jwt-decode')
const axios = require('axios')
const { decode } = require('mnid')
if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

const appName = process.env.APP_NAME
const address = process.env.ADDRESS
const privateKey = process.env.PRIVATE_KEY
const emailUser = process.env.EMAIL_USER
const emailPass = process.env.EMAIL_PASS
const host = process.env.HOST
const port = process.env.PORT || 3000
const EVENTBRITE_CLIENT_KEY = process.env.EVENTBRITE_CLIENT_KEY
const EVENTBRITE_CLIENT_SECRET = process.env.EVENTBRITE_CLIENT_SECRET

const uPortApp = new uport.Credentials({
  appName: appName,
  address: address,
  signer: new uport.SimpleSigner(privateKey)
})

app.use(bodyParser.json({ strict: false }))

app.get('/', (req, res) => function (req, res) {
  // TODO: とりあえずのフローなんでもっといいのあったらそっちにする
  // - student: put email to form
  res.send('Super duper coolest email form!!!')
})

app.post('/events/:id/register', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')


  // TODO: とりあえずのフローなんでもっといいのあったらそっちにする
  // - system: send QR to email
  // - student: scan QR
  // - student: accept verification
  // - system: got hit /verify action

  let verifier = new EmailVerifier({
    credentials: uPortApp,
    callbackUrl: `https://${host}/events/${req.body.id}/verify`,
    user: emailUser,
    pass: emailPass,
    service: 'gmail',
    confirmationSubject: 'uPort Identity ',
    confirmationTemplate: qr => `<html>...${qr}...</html>`,
    attestationSubject: 'uPort Email Attestation',
    attestationTemplate: qr => `<html>...${qr}...</html>`,
    customRequestParams: {},
    qrFolder: './tmp'
  })

  const email = req.body.email
  const requestToken = verifier.receive(email)

  res.json({ msg: 'success' })
})

app.get('/events/:id/verify', async function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  const accessToken = req.body.access_token
  const requestToken = jwtDecode(accessToken).req
  const callbackUrlWithEmail = jwtDecode(requestToken).callback
  const email = url.parse(callbackUrlWithEmail, true).query.email


  // TODO: とりあえずのフローなんでもっといいのあったらそっちにする
  // - system: get NMID->ProxyContract_ADDR->NFT_ADDR
  let mnid = ...
  let nft_owner_addr = decode(mnid).address

  // - system: get NFT.isStudent state
  let web3 = ...
  let nft_addr = NakajoDictionaryContract.at("const").findNFT(nft_owner_addr)
  let isStudent = GakuseiContract.at(nft_addr).isStudent()

  if (!isStudent) res.json({ msg: 'Failed. You might be not a student', coupon: null });

  // - system: generate onetime coupon by "bytes6(sha3(MNID + EventID))"
  let coupon = `bytes6(sha3(MNID+${req.body.id}))`

  // - system: OAuth to EventBrite
  let code = await axios.get(`https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=${EVENTBRITE_CLIENT_KEY}`)
  let access_token = await axios({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `code=${code}&client_secret=${EVENTBRITE_CLIENT_SECRET}&client_id=${EVENTBRITE_CLIENT_KEY}&grant_type=authorization_code`,
    "https://www.eventbrite.com/oauth/token",
  })

  // - system: Save coupon to EventBrite
  /* format
  discount.code	string	Yes	Code used to activate discount.
  discount.type	string	No	The type of discount. (Valid choices are: access, hold, coded, or public)
  discount.amount_off	string	No	Fixed reduction amount.
  discount.percent_off	string	No	Percentage reduction.
  discount.event_id	string	No	ID of the event. Only used for single event discounts.
  discount.ticket_class_ids	list	No	IDs of tickets to limit discount to.
  discount.quantity_available	integer	No	Number of discount uses.
  discount.start_date	string	No	Allow use from this date. A datetime represented as a string in Naive Local ISO8601 date and time format, in the timezone of the event.
  discount.start_date_relative	integer	No	Allow use from this number of seconds before the event starts. Greater than 59 and multiple of 60.
  discount.end_date	string	No	Allow use until this date. A datetime represented as a string in Naive Local ISO8601 date and time format, in the timezone of the event.
  discount.end_date_relative	integer	No	Allow use until this number of seconds before the event starts. Greater than 59 and multiple of 60.
  discount.ticket_group_id	string	No	ID of the ticket group.
  discount.hold_ids	list	No	IDs of holds this discount can unlock.
  */
  let access_token = await axios({
    method: 'get',
    headers: { 'Authorization': `Bearer ${access_token}`},
    data: {
      "discount.code": coupon,
      "discount.type": "",
      "discount.amount_off": "",
      "discount.percent_off": "",
      "discount.event_id": "",
      "discount.ticket_class_ids": "",
      "discount.quantity_available": "",
      "discount.start_date": "",
      "discount.start_date_relative": "",
      "discount.end_date": "",
      "discount.end_date_relative": "",
      "discount.ticket_group_id": "",
      "discount.hold_ids": ""
    },
    "https://www.eventbrite.com/oauth/token",
  })

  res.json({ msg: 'success', coupon: coupon });
})

app.listen(port, () => console.log('Example app listening on port ' + port + '!'))