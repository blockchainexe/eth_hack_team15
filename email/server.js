const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const jwtDecode = require('jwt-decode');
const request = require('superagent');
const url = require('url');
const express = require('express')
const app = express()
const uport = require('uport');
const EmailVerifier = require('uport-verify-email').default;
require('dotenv').config();
const host = process.env.HOST; // Must be external IP coz this is used in callback access
const port = process.env.PORT;

// slack confg
const org = process.env.ORG
const slack_token = process.env.SLACK_TOKEN

// uport app config
const appName = process.env.APP_NAME;
const address = process.env.ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

// email config
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// set up the uport app credentials
const uPortApp = new uport.Credentials({
    appName: appName,
    address: address,
    signer: new uport.SimpleSigner(privateKey)
});

// set up the email account for sending verification QRs
// pass the uport app credentials
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
    qrFolder: '/tmp/'
});

app.use(bodyParser.json({ strict: false }));

app.options("/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    const allowHeader = req.header("Access-Control-Request-Headers");
    res.header("Access-Control-Allow-Headers", allowHeader ? allowHeader : "*");
    res.send(200);
});

app.post('/register', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    // endpoint reads email from request params
    const email = req.body.email;

    // send an email to user containing the request QR and return the token
    const requestToken = verifier.receive(email);

    res.json({ msg: 'success' });
})

app.post('/verify', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    // endpoint reads access token from POST data
    const accessToken = req.body.access_token;

    const requestToken = jwtDecode(accessToken).req
    const callbackUrlWithEmail = jwtDecode(requestToken).callback
    const email = url.parse(callbackUrlWithEmail, true).query.email
    // const data = {
    //     "email": email,
    //     "token": slack_token,
    //     "ultra_restricted": 1,
    //     "set_active": true
    // }

    // TODO: check if users email domain is ac.jp or edu

    // request sending email to slack for inviting users
    // request.post(`https://${org}.slack.com/api/users.admin.invite`).type('form').send(data).end(function (err, res){
    //     if (err) return 
    //     if (200 != res.status) {
    //         console.error(`Invalid response ${res.status}.`)
    //         return
    //     }
    //     console.log(res.body)
    //     const ok = res.body.ok
    //     const error = res.body.error 
    //     if (!ok) {
    //         if (error === 'already_invited') {
    //             console.error('You have already been invited to Slack')
    //         } else if (error === 'already_in_team') {
    //             console.error(`Sending you to Slack...`)
    //         } else {
    //             console.error(error)
    //         }
    //     }
    // })

    // sign an attestation claiming control of the email
    // by default, push the attestation and send an email with QR to download
    const identity = verifier.verify(accessToken);
    console.log(identity)
    

    res.json({ msg: 'success' });
})

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports.handler = serverless(app);