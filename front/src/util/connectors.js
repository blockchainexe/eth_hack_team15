import { Connect, SimpleSigner } from 'uport-connect'
require('dotenv').config()

const appName = 'nakajo sample app'; //process.env.UPORT_APP_NAME;
const mnidAddress = '2oywovjugjBXux7izGsxJq8oeokLcZoJbsy'; //process.env.UPORT_CLIENT_ID;
const signingKey = '28acf511d9efab53d8a0f5824a061c60308b54e22bea9d280d1bc660560c1209'; //process.env.UPORT_PRIVATE_KEY;

const uport = new Connect(appName, {
      clientId: mnidAddress,
      network: 'rinkeby',
      signer: SimpleSigner(signingKey)
    })


const web3 = uport.getWeb3()

export { web3, uport }
