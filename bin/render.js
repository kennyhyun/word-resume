#! /usr/bin/env node

const docx = require('docx');
const moment = require('moment');
const generateDocument = require('../lib');

(async () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const yaml = require('js-yaml');

  const [,,inputFile] = process.argv;
  const readFile = promisify(fs.readFile);
  const writeFile = promisify(fs.writeFile);

  const styles = await readFile('./styles.xml', 'utf-8');
  const s = yaml.load(await readFile(inputFile || './resume2018.yml'));
  const doc = generateDocument(s, styles);
  const packer = new docx.Packer();
  const buffer = await packer.toBuffer(doc);
  const { author } = s.header;
  await writeFile(`${author}-${moment().format('DDMMMYYYY')}.docx`, buffer);
})();
