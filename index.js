const yaml = require('js-yaml');
const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const forEach = require('lodash/forEach');
const readFile = promisify(fs.readFile);

const formatDuration = s => {
  const [start, end] = s.split('~');
  const mstart = moment(start.trim(), 'DD MMM YYYY');
  const mend = end && moment(end.trim(), 'DD MMM YYYY') ;

  return `${mstart.format('MMM YYYY')} ~ ${mend ? mend.format('MMM YYYY') : ''} (${
    mend ? mend.diff(mstart, 'months') + 1 + ' months' : 'to date'
  })`;
};

const outputWork = data => {
  console.info(`${data.company} -- ${data.location}`);
  console.info(`    ${data.title}; ${data.field}`);
  console.info('   ', formatDuration(data.duration));
  if (data.achievements) {
    data.achievements.forEach(a => console.info('    -', a));
  }
  if (data.skills) {
    console.info('    *', data.skills.join(', '));
  }
};

const outputEducation = data => {
  console.info(`${data.title} -- ${data.acquisition}`);
  console.info(`    ${data.major}`);
  console.info(`    ${data.institute} -- ${data.location}`);
  if (data.achievements) {
    data.achievements.forEach(a => console.info('    -', a));
  }
};

const outputProfile = data => {
  const indent = '                                 ';
  console.info('   ', data.title);
  console.info(indent, data.email);
  console.info(indent, data.address);
  console.info('');
  console.info('   ', data.carrierSummary.default);

  if (data.technicalSkills) {
    forEach(data.technicalSkills, (v, k) => {
      console.info(`    * ${k}:`);
      console.info('      ', v.join(', '));
    });
  }
};

// main OUTPUT
(async () => {
  const s = yaml.load(await readFile('resume2018.yml'));

  s.header.paragraphs.forEach(p => {
    const data = s.data[p.source];
    const titleKey = p.title.startsWith('$') ? p.title.slice(1) : '';
    console.info(titleKey ? data[titleKey] : p.title, '\n');

    if (Array.isArray(data)) {
      // return;
      data.forEach((d, idx) => {
        if (!p.first || idx < p.first) {
          if (d.company) {
            outputWork(d);
          } else if (d.institute) {
            outputEducation(d);
          } else {
            console.info('   ', d);
          }
        }
      });
    } else {
      outputProfile(data);
    }
    console.info('\n');
  });

})();
