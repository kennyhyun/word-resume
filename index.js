const yaml = require('js-yaml');
const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const forEach = require('lodash/forEach');
const docx = require('docx');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// contents : string[] or string
const createParagraph = contents => {
  let line;
  if (Array.isArray(contents)) {
    line = contents[0];
  } else {
    line = contents;
  }
  const paragraph = new docx.Paragraph(line);
  if (Array.isArray(contents) && contents.length >= 1) {
    contents.slice(1).forEach(str => {
      paragraph.addRun(new docx.TextRun(str).break());
    });
  }
  return paragraph;
};

const appendParagraph = (p, contents, br = false) => {
  const putBreak = t => (br ? t.break() : t);
  if (Array.isArray(contents)) {
    contents.forEach(str => {
      p.addRun(putBreak(new docx.TextRun(str)));
    });
  } else {
    p.addRun(putBreak(new docx.TextRun(contents)));
  }
};

const insertBlankParagraph = doc => {
  const p = createParagraph('');
  doc.addParagraph(p);
};

const formatDuration = s => {
  const [start, end] = s.split('~');
  const mstart = moment(start.trim(), 'DD MMM YYYY');
  const mend = end && moment(end.trim(), 'DD MMM YYYY');

  return `${mstart.format('MMM YYYY')} ~ ${mend ? mend.format('MMM YYYY') : ''} (${
    mend ? mend.diff(mstart, 'months') + 1 + ' months' : 'to date'
  })`;
};

const outputWork = (doc, data) => {
  const p = createParagraph([
    `${data.company} -- ${data.location}`,
    `    ${data.title}; ${data.field}`,
    '    ' + formatDuration(data.duration),
  ]);
  if (data.achievements) {
    data.achievements.forEach(a => appendParagraph(p, '    - ' + a));
  }
  if (data.skills) {
    appendParagraph(p, '    * ' + data.skills.join(', '));
  }
  doc.addParagraph(p);
};

const outputEducation = (doc, data) => {
  const p = createParagraph([
    `${data.title} -- ${data.acquisition}`,
    `    ${data.major}`,
    `    ${data.institute} -- ${data.location}`,
  ]);
  if (data.achievements) {
    data.achievements.forEach(a => appendParagraph(p, `    - ${a}`));
  }
  doc.addParagraph(p);
};

const outputLanguage = (doc, data) => {
  const p = createParagraph(`    ${data}`);
  doc.addParagraph(p);
};

const outputProfile = (doc, data) => {
  const indent = '                                 ';
  const p = createParagraph([
    `    ${data.title}`,
    `${indent} ${data.email}`,
    `${indent} ${data.address}`,
    '',
    `    ${data.carrierSummary.default}`,
  ]);

  if (data.technicalSkills) {
    forEach(data.technicalSkills, (v, k) => {
      appendParagraph(p, `    * ${k}`);
      appendParagraph(p, `       ${v.join(', ')}`);
    });
  }
  doc.addParagraph(p);
};

// main OUTPUT
(async () => {
  const s = yaml.load(await readFile('resume2018.yml'));

  const doc = new docx.Document();

  s.header.paragraphs.forEach(p => {
    const data = s.data[p.source];
    const titleKey = p.title.startsWith('$') ? p.title.slice(1) : '';
    const header = createParagraph(titleKey ? data[titleKey] : p.title);
    doc.addParagraph(header);

    if (Array.isArray(data)) {
      // return;
      data.forEach((d, idx) => {
        if (!p.first || idx < p.first) {
          if (d.company) {
            outputWork(doc, d);
          } else if (d.institute) {
            outputEducation(doc, d);
          } else {
            outputLanguage(doc, d);
          }
        }
      });
    } else {
      outputProfile(doc, data);
    }
    insertBlankParagraph(doc);
  });

  // doc.document.body.root.forEach(p => console.log(p));

  const packer = new docx.Packer();
  const buffer = await packer.toBuffer(doc);
  await writeFile('output.docx', buffer);
})();
