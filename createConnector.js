const
  { config } = require('./config'),
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
      // need RAW response type to get the Location header
      // which contains the URL to the schema creation status
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

    const body = await res.json();

    const status = body.status;
    if (status === 'completed') {
      console.log('Schema created');
    }
    else {
      console.error(`Schema creation failed: ${body.error.message}`);
    }
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