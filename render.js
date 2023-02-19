import { generateDocument } from './word-resume/src/render';
import moment from 'moment';
import { Packer } from 'docx';
import { promises as fsp } from 'fs';

const { RESUME_SRC = './resume/resume.yml' } = process.env;

Promise.resolve().then(async () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const yaml = require('js-yaml');

  const [, , inputFile] = process.argv;

  const styles = await fsp.readFile('./styles.xml', 'utf-8');
  const s = yaml.load(await fsp.readFile(inputFile || RESUME_SRC));
  const doc = generateDocument(s, styles);
  const packer = new Packer();
  const buffer = await packer.toBuffer(doc);
  const { author } = s.header;
  const outputFilename = `./output/${author}-${moment().format('DDMMMYYYY')}.docx`;
  await fsp
    .writeFile(outputFilename, buffer)
    .catch(async e => {
      console.warn(e.message);
      const renamed = `${outputFilename}.copy`;
      await fsp.writeFile(renamed);
      return renamed;
    })
    .then(renamed => console.log('Rendered', renamed || outputFilename));
});
