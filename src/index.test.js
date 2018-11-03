const generateSeed = require('./seeder');
const generateDocument = require('./');

it('should match snapshot', () => {
  const source = generateSeed('jest test context');
  const doc = generateDocument(source);
  expect(doc).toMatchSnapshot();
});
