const generateSeed = require('./seeder');
const generateDocument = require('./');

it('should match snapshot', () => {
  const now = new Date('2018-11-01');
  const source = generateSeed('jest test context', undefined, now);
  const doc = generateDocument(source, undefined, now);
  const [Created, Modified] = doc.coreProperties.root.slice(-2);
  Created.root.pop();
  Modified.root.pop();
  
  expect(doc).toMatchSnapshot();
});
