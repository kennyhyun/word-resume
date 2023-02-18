import generateSeed from '../seeder';

describe('generateSeed', () => {
  it('should seed sample yml', () => {
    const now = new Date('2018-11-01');
    const source = generateSeed('jest test context', now);
    expect(source).toMatchSnapshot();
  });
});
