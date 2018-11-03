const generateDocument = require('./');

console.log(process.argv[1]);
console.log(__filename);

it('should match snapshot', () => {
  expect({}).toMatchSnapshot();
});
