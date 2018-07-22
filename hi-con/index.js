const express = require('express')
const app = express()
const uport = require('uport')
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
const NETWORK_ID = process.env.NETWORK_ID

const uPortApp = new uport.Credentials({
  appName: appName,
  address: address,
  signer: new uport.SimpleSigner(privateKey)
})

app.use(bodyParser.json({ strict: false }))
app.set('view engine', 'ejs')

app.options("/*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  const allowHeader = req.header("Access-Control-Request-Headers");
  res.header("Access-Control-Allow-Headers", allowHeader ? allowHeader : "*");
  res.send(200);
});

app.get('/', async (req, res) => {
  res.render('pages/index', {
    host: host,
    port: port,
    uportAppNames: appName
  });
})

// client側でrequestCredentialsするので不要
// app.post('/events/:id/request_token', async (req, res) => {
//   const requestToken = await uPortApp.createRequest({
//     network_id: NETWORK_ID,
//     requested: ['email'],
//     callbackUrl: `http://${host}${port ? ":"+port : ""}/events/${req.body.id}/coupon` // URL to send the response of the request to
//   })
//   res.send(requestToken)
// })

app.post('/events/:id/coupon', async (req, res) => {
  const profile = uPortApp.receive(req.body.responseToken)

  if (!profile.isStudent) res.json({ msg: 'Failed. You might be not a student', coupon: null });

  // - system: generate onetime coupon by "bytes6(sha3(MNID + EventID))"
  let coupon = `bytes6(sha3(${profile.mnid}+${req.params.id}))`

  // - system: OAuth to EventBrite
  let code = await axios.get(`https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=${EVENTBRITE_CLIENT_KEY}`)
  let access_token = await axios({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `code=${code}&client_secret=${EVENTBRITE_CLIENT_SECRET}&client_id=${EVENTBRITE_CLIENT_KEY}&grant_type=authorization_code`,
    url: "https://www.eventbrite.com/oauth/token"
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
  let coupon_res = await axios({
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
    url: "https://www.eventbrite.com/oauth/token"
  })

  res.json({ msg: 'success', coupon: coupon });
})

app.listen(port, () => console.log('Example app listening on port ' + port + '!'))
