const express = require('express')
const app = express()
const uport = require('uport')
const EmailVerifier = require('uport-verify-email').default
const bodyParser = require('body-parser')

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
  callbackUrl: `http://${host}${ (port) ? ":"+port : "" }/verify`, // TODO: change callback url
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

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');

  const email = req.body.email
  const requestToken = verifier.receive(email);

  res.json({ msg: 'success' });
})

app.listen(port, () => console.log('Example app listening on port 3000!'))
