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

    doc.content = removeMd(doc.content.replace(/<[^>]+>/g, ' ')),
      doc.url = url.resolve(baseUrl, doc.data.slug);

    content.push(post);
  });

  return content;
}

function transform() {

}

function load() {

}

function main() {
  const content = extract();
  const transformed = transform(content);
  load(transformed);
}