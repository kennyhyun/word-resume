#! /usr/bin/env node

const fs = require('fs');
const { promisify } = require('util');
const yaml = require('js-yaml');

const generateSeed = require('../lib/seeder.js');

(async () => {
  const [,,outputFile] = process.argv;
  const writeFile = promisify(fs.writeFile);
  const d = generateSeed(`${new Date()}`);
  await writeFile(outputFile || 'sample.yml', yaml.dump(d));
})();
