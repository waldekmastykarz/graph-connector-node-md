// todo get options from yargs

const fs = require('fs'),
  path = require('path'),
  url = require('url'),
  matter = require('gray-matter'),
  removeMd = require('remove-markdown'),
  argv = require('yargs').argv,
  { client } = require('./graphClient'),
  { config } = require('./config');

const contentDir = path.join(__dirname, 'content');
const baseUrl = 'https://blog.mastykarz.nl';

function extract() {
  var content = [];
  var contentFiles = fs.readdirSync(contentDir);

  contentFiles.forEach(f => {
    if (!f.endsWith('.markdown') && !f.endsWith('.md')) {
      return;
    }

    const fileContents = fs.readFileSync(path.resolve(contentDir, f), 'utf-8');
    const doc = matter(fileContents);

    doc.content = removeMd(doc.content.replace(/<[^>]+>/g, ' '));
    doc.url = url.resolve(baseUrl, doc.data.slug);
    doc.data.image = url.resolve(baseUrl, doc.data.image);

    content.push(doc);
  });

  return content;
}

function transform(content) {
  return content.map(doc => {
    return {
      id: doc.data.slug,
      properties: {
        title: doc.data.title,
        excerpt: doc.data.excerpt,
        imageUrl: doc.data.image,
        url: doc.url,
        // Date must be in the ISO 8601 format
        date: new Date(doc.data.date).toISOString(),
        'tags@odata.type': 'Collection(String)',
        tags: doc.data.tags
      },
      content: {
        value: doc.content,
        type: 'text'
      },
      acl: [
        {
          accessType: 'grant',
          type: 'everyone',
          value: 'everyone'
        }
      ]
    }
  });
}

async function load(content) {
  const { id } = config.connector;
  for (const doc of content) {
    console.log(`Loading ${doc.id}...`);
    try {
      await client
        .api(`/external/connections/${id}/items/${doc.id}`)
        .header('content-type', 'application/json')
        .put(doc);
      console.log(`  DONE`);
    }
    catch (e) {
      console.error(`Failed to load ${doc.id}: ${e.message}`);
      if (e.body) {
        console.error(`${JSON.parse(e.body, null, 2)?.innerError?.message}`);
      }
      return;
    }
  }
}

async function main() {
  const content = extract();
  const transformed = transform(content);
  await load(transformed);
}

main();