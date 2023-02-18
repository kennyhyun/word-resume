import generateSeed from '../seeder';

describe('generateSeed', () => {
  it('should seed sample yml', () => {
    const now = new Date('20i23-02-01');
    const source = generateSeed('jest test context', now);
    expect(source).toMatchSnapshot();
  });
});


