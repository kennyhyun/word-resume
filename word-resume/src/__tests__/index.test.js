import { promises as fsp } from 'fs';
import { Packer } from 'docx';
import AdmZip from 'adm-zip';

const generateDocument = require('../');
const generateSeed = require('../seeder');

describe('generateDocument', () => {
  it('should match snapshot', async () => {
    const now = new Date('2018-11-01');
    const source = generateSeed('jest test context', now);

    const doc = generateDocument(source, undefined, now);
    const [Created, Modified] = doc.coreProperties.root.slice(-2);
    Created.root.pop();
    Modified.root.pop();

    const packer = new Packer();
    const docBuffer = await packer.toBuffer(doc);
    const filename = './test.docx';
    await fsp.writeFile(filename, docBuffer);
    const zip = AdmZip(filename);
    const docEntry = zip
      .getEntries()
      .find(({ entryName }) => entryName === 'word/document.xml');
    expect(zip.readFile(docEntry).toString()).toMatchSnapshot();
  });
});
