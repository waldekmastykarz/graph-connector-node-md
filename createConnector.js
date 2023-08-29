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
      .header('content-type', 'application/json')
      .post({
        baseType: 'microsoft.graph.externalItem',
        properties: schema
      });

    const status = res.status;
    if (status === 'completed') {
      console.log('Schema created');
    }
    else {
      console.error(`Schema creation failed: ${res.error.message}`);
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