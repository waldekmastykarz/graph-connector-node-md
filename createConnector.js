const { config } = require('./config'),
  { client } = require('./graphClient'),
  { ResponseType } = require('@microsoft/microsoft-graph-client');

async function createConnector() {
  console.log('Creating connector...');

  const { id, name, description } = config.connector;
  await client
    .api('/external/connections')
    .post({
      id,
      name,
      description
    });

  console.log('Connector created');
}

async function createSchema() {
  console.log('Creating schema...');

  const { id, schema } = config.connector;
  try {
    const res = await client
      .api(`/external/connections/${id}/schema`)
      .responseType(ResponseType.RAW)
      .header('content-type', 'application/json')
      .post({
        baseType: 'microsoft.graph.externalItem',
        properties: schema
      });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Failed to create schema: ${res.statusText}. ${JSON.stringify(error, null, 2)}`);
    }

    console.log('Creation request sent. Checking status...');

    do {
      const statusRes = await client.api(res.headers.get('Location')).get();
      console.log(statusRes);
      console.log('Wait 3s...')
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    while (statusRes.status === 'inprogress');

    console.log('Schema created');
  }
  catch (e) {
    console.error(e);
  }
}

async function main() {
  await createConnector();
  await createSchema();
}

main();