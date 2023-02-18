const Chance = require('chance');
const moment = require('moment');

// console.log(timelines);

const data = (c, timelines = []) => {
  const times = [...timelines];
  const profession = c.profession();

  const getTime = (next = false) => {
    if (next) times.pop();
    return times.slice(-1)[0];
  };

  const createWorkHistory = isCurrent => {
    return {
      company: c.company(),
      location: c.city(),
      type: c.bool() ? 'permanent' : 'contract',
      duration: `${moment(getTime()).format('DD MMM YYYY')} ~${
        isCurrent ? '' : ' ' + moment(getTime(true)).format('DD MMM YYYY')
      }`,
      title: profession,
      field: c.sentence({ words: 3 }),
      achievements: [
        c.sentence({ words: 13 }),
        c.sentence({ words: 13 }),
        c.sentence({ words: 13 }),
        c.sentence({ words: 13 }),
      ].slice(0, c.integer({ min: 0, max: 3 })),
      skills: [
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
        c.word(),
      ].slice(0, c.integer({ min: 3, max: 9 })),
    };
  };

  const author = c.name();
  const educationHistory = [
    {
      institute: c.city() + ' University',
      major: profession + ' Engineering',
      location: c.city() + ', ' + c.country(),
      duration: moment(getTime()).format('MMM YYYY'),
      title: 'Bachelor of Engineering',
      acquisition: moment(getTime(true)).format('MMM YYYY'),
    },
  ];
  const workHistory = [
    createWorkHistory(),
    createWorkHistory(),
    createWorkHistory(),
    createWorkHistory(),
    createWorkHistory(true),
  ].reverse();

  return {
    header: {
      author,
      title: 'Resume',
      description: 'sample seed data generated by seed',
      paragraphs: [
        { source: 'profile', title: '$name' },
        {
          source: 'workHistory',
          title: 'Work History',
          first: 6,
          digestRest: true,
        },
        { source: 'educationHistory', title: 'Education', first: 4 },
        { source: 'language', title: 'language' },
      ],
    },

    data: {
      profile: {
        name: author,
        title: profession,
        email: c.email(),
        address: c.address(),
        phone: c.phone(),
        carrierSummary: {
          default: c.sentence() + ' ' + c.sentence(),
          frontend: c.sentence() + ' ' + c.sentence(),
        },
        technicalSkills: {
          programmingLanguages: [
            `${c.syllable()}lang`,
            `${c.syllable()}lang`,
            `${c.syllable()}lang`,
          ],
          generalOfficeSkills: [
            c.word(),
            c.word(),
            c.word(),
            c.word(),
            c.word(),
            c.word(),
            c.word(),
          ],
        },
      },
      workHistory,
      educationHistory,
      language: [c.animal() + 'ese', c.animal() + 'ese', c.animal() + 'ese'],
    },
  };
};

const generateSeed = (seed = 'resume-generator-seed-1', now = new Date(), filename) => {
  const c = new Chance(seed);
  const year = now.getFullYear();
  const times = [
    ...new Set(
      Array(20)
        .fill(null)
        .map(_ => c.year({ min: year - 20, max: year }))
    ),
  ]
    .map(year => c.date({ year }))
    .sort((a, b) => b - a);

  console.log('times:', times);
  const jsonData = data(c, times);
  if (typeof filename === 'string') {
    const fs = require('fs');
    const { promisify } = require('util');
    const yaml = require('js-yaml');
    const writeFile = promisify(fs.writeFile);
    writeFile(filename, yaml.dump(jsonData)).catch(e => console.error(e));
  }
  return jsonData;
};

// console.log(yaml.dump(data));
if (process.argv[2] === __filename) {
  (async () => {
    generateSeed('resume=generator-seed-1', new Date(), 'sample.yml');
  })();
}

module.exports = generateSeed;
