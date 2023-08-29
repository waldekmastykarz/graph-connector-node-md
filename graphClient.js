require('isomorphic-fetch');
const
  { appInfo } = require('./env'),
  argv = require('yargs').argv,
  { Client, MiddlewareFactory } = require('@microsoft/microsoft-graph-client'),
  { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'),
  { ClientSecretCredential } = require('@azure/identity'),
  { HttpsProxyAgent } = require('https-proxy-agent');

const credential = new ClientSecretCredential(
  appInfo.tenantId,
  appInfo.appId,
  appInfo.secrets[0].value
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
});

function DebugMiddleware() {
  this.nextMiddleware = undefined;

  const getHeaders = (headers) => {
    const h = {};
    for (var header of headers.entries()) {
      h[header[0]] = header[1];
    }
    return h;
  };

  return {
    execute: async (context) => {
      console.debug('');
      console.debug(`Request: ${context.request}`);
      console.debug(JSON.stringify(context.options, null, 2));

      await this.nextMiddleware.execute(context);

      const resp = context.response.clone();

      const headers = getHeaders(resp.headers);
      console.debug('');
      console.debug('Response headers:');
      console.debug(JSON.stringify(headers, null, 2));
      if (headers.hasOwnProperty('content-type') &&
        headers['content-type'].startsWith('application/json') &&
        resp.body) {
        console.debug('');
        console.debug('Response body:');
        console.debug(JSON.stringify(await resp.json(), null, 2));
      }
    },
    setNext: (next) => {
      this.nextMiddleware = next;
    }
  }
}

function CompleteJobWithDelayMiddleware(delayMs) {
  this.nextMiddleware = undefined;
  this.execute = async (context) => {
    // wait for response
    await this.nextMiddleware.execute(context);

    const location = context.response.headers.get('location');
    if (location) {
      console.debug(`Location: ${location}`);
      console.log(`Waiting ${delayMs}ms before following location ${location}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));

      context.request = location;
      context.options.method = 'GET';
      context.options.body = undefined;
      await this.execute(context);
      return;
    }

    console.debug(`Request: ${context.request}`);
    if (context.request.indexOf('/operations/') < 0) {
      // not a job
      return;
    }

    const res = context.response.clone();
    if (!res.ok) {
      console.debug('Response is not OK');
      return;
    }
    const body = await res.json();
    console.debug(`Status: ${body.status}`);
    if (body.status === 'inprogress') {
      console.debug(`Waiting ${delayMs}ms before trying again...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      context.request = context.request + "-done";
      await this.execute(context);
    }
  }

  return {
    execute: async (context) => {
      return await this.execute(context);
    },
    setNext: (next) => {
      this.nextMiddleware = next;
    }
  }
}

const middleware = MiddlewareFactory.getDefaultMiddlewareChain(authProvider);
middleware.unshift(new CompleteJobWithDelayMiddleware(10000));

let fetchOptions = undefined;
if (argv.withProxy) {
  const proxyAgent = new HttpsProxyAgent('http://0.0.0.0:8000');
  fetchOptions = {
    agent: proxyAgent
  };
}

module.exports = { client: Client.initWithMiddleware({ middleware, fetchOptions }) };