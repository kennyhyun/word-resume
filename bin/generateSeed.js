#! /usr/bin/env node

const fs = require('fs');
const { promisify } = require('util');
const yaml = require('js-yaml');

const generateSeed = require('../lib/seeder.js');

const [,,outputFile] = process.argv;
const writeFile = promisify(fs.writeFile);
generateSeed(`${new Date()}`, new Date(), outputFile || 'sample.yml');
