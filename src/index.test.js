const generateSeed = require('./seeder');
const generateDocument = require('./');

it('should match snapshot', () => {
  const source = generateSeed('jest test context');
  const doc = generateDocument(source);
  const [Created, Modified] = doc.coreProperties.root.slice(-2);
  Created.root.pop();
  Modified.root.pop();
  
  expect(doc).toMatchSnapshot();
});
