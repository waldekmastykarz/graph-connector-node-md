import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client, MiddlewareFactory } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import yargs from 'yargs';
import { CompleteJobWithDelayMiddleware } from './completeJobWithDelayMiddleware.js';
import { appInfo } from './env.js';

const credential = new ClientSecretCredential(
  appInfo.tenantId,
  appInfo.appId,
  appInfo.secrets[0].value
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
});

const middleware = MiddlewareFactory.getDefaultMiddlewareChain(authProvider);
middleware.unshift(new CompleteJobWithDelayMiddleware(10000));

let fetchOptions = undefined;
if (yargs().argv.withProxy) {
  const proxyAgent = new HttpsProxyAgent('http://0.0.0.0:8000');
  fetchOptions = {
    agent: proxyAgent
  };
}

export const client = Client.initWithMiddleware({ middleware, fetchOptions });