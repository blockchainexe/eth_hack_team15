const express = require('express')
const app = express()
const uport = require('uport')
const EmailVerifier = require('uport-verify-email').default
const bodyParser = require('body-parser')
const jwtDecode = require('jwt-decode')
const url = require('url')

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

const uPortApp = new uport.Credentials({
  appName: appName,
  address: address,
  signer: new uport.SimpleSigner(privateKey)
})

const verifier = new EmailVerifier({
  credentials: uPortApp,
  callbackUrl: `https://${host}/verify`,
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

app.use(bodyParser.json({ strict: false }))

app.options('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  const allowHeader = req.header('Access-Control-Request-Headers')
  res.header('Access-Control-Allow-Headers', allowHeader ? allowHeader : '*')
  res.send(200)
});

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')

  const email = req.body.email
  const requestToken = verifier.receive(email)

  res.json({ msg: 'success' })
})

app.post('/verify', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");

  const accessToken = req.body.access_token

  const requestToken = jwtDecode(accessToken).req
  const callbackUrlWithEmail = jwtDecode(requestToken).callback
  const email = url.parse(callbackUrlWithEmail, true).query.email

  const identity = verifier.verify(accessToken)

  res.json({ msg: 'success', identity: identity })
})

app.listen(port, () => console.log('Example app listening on port ' + port + '!'))
