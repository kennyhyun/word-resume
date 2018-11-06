const generateDocument = require('./');
const generateSeed = require('./seeder');

it('should match snapshot', () => {
  const now = new Date('2018-11-01');
  const source = generateSeed('jest test context', now);
  const doc = generateDocument(source, undefined, now);
  const [Created, Modified] = doc.coreProperties.root.slice(-2);
  Created.root.pop();
  Modified.root.pop();
  
  expect(doc).toMatchSnapshot();
});
