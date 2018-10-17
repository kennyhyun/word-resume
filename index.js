const yaml = require('js-yaml');
const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const forEach = require('lodash/forEach');
const docx = require('docx');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const humanize = require('underscore.string/humanize');

// contents : string[] or string
const createParagraph = (contents, opt = {}) => {
  const paragraph = new docx.Paragraph();
  let line;
  if (Array.isArray(contents)) {
    line = contents[0];
  } else {
    line = contents;
  }
  const { br = true, boldFirst = false } = opt;
  const putBold = t => (boldFirst ? t.bold() : t);
  const putBreak = t => (br ? t.break() : t);
  paragraph.addRun(putBold(new docx.TextRun(line)));
  if (Array.isArray(contents) && contents.length >= 1) {
    contents.slice(1).forEach(str => {
      paragraph.addRun(putBreak(new docx.TextRun(str)));
    });
  }
  return paragraph;
};

const appendParagraph = (p, contents, opt = {}) => {
  const { br = true, boldFirst = false } = opt;
  const putBold = t => (boldFirst ? t.bold() : t);
  const putBreak = t => (br ? t.break() : t);
  if (Array.isArray(contents)) {
    p.addRun(putBold(putBreak(new docx.TextRun(contents[0]))));
    contents.slice(1).forEach(str => {
      p.addRun(putBreak(new docx.TextRun(str)));
    });
  } else {
    p.addRun(putBreak(putBold(new docx.TextRun(contents))));
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

  return `${mstart.format('MMM YYYY')} ~ ${mend ? mend.format('MMM YYYY') : 'to date'} ${`(${(mend || moment()).diff(
    mstart,
    'months',
  ) + 1} months${mend ? '' : ' ~'})`}`;
};

const outputWork = (doc, data, opt = {}) => {
  const { digest = false } = opt;
  const p = createParagraph([data.company, ` -- ${data.location}`], { br: false, boldFirst: true });
  appendParagraph(p, `    ${data.title}; ${data.field}`);
  appendParagraph(p, '    ' + formatDuration(data.duration), { boldFirst: !digest });
  if (!digest) {
    if (data.achievements) {
      data.achievements.forEach(a => appendParagraph(p, '    - ' + a));
    }
    if (data.skills) {
      appendParagraph(p, '    * ' + data.skills.join(', '));
    }
  }
  doc.addParagraph(p);
};

const outputEducation = (doc, data) => {
  const p = createParagraph([data.title, ` -- ${data.acquisition}`], { br: false, boldFirst: true });
  appendParagraph(p, `    ${data.major}`);
  appendParagraph(p, `    ${data.institute} -- ${data.location}`);
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
  const p1 = createParagraph([data.title, data.email, data.address]).right();
  doc.addParagraph(p1);

  const p = createParagraph(['', `    ${data.carrierSummary.default}`, '']);

  if (data.technicalSkills) {
    forEach(data.technicalSkills, (v, k) => {
      appendParagraph(p, `    * ${humanize(k)}`);
      appendParagraph(p, `      ${v.join(', ')}`);
    });
  }
  doc.addParagraph(p);
};

// main OUTPUT
(async () => {
  const s = yaml.load(await readFile('resume2018.yml'));
  const { author, title, description } = s.header;
  const doc = new docx.Document({ author, title, description }, { top: 100, right: 1200 });

  const footer = doc.Footer.createParagraph().right();
  const pageNumber = new docx.TextRun(`${author} ${moment().format('DDMMMYYYY')} : `).pageNumber();
  footer.addRun(pageNumber);

  s.header.paragraphs.forEach((p, pIdx) => {
    const data = s.data[p.source];
    const titleKey = p.title.startsWith('$') ? p.title.slice(1) : '';
    const header = createParagraph(titleKey ? data[titleKey] : p.title, { boldFirst: true });
    if (pIdx === 0) {
      header.heading1();
    } else {
      header.heading2();
    }
    doc.addParagraph(header);

    if (Array.isArray(data)) {
      // return;
      data.forEach((d, idx) => {
        if (!p.first || idx < p.first) {
          if (d.company) {
            outputWork(doc, d);
            insertBlankParagraph(doc);
          } else if (d.institute) {
            outputEducation(doc, d);
            insertBlankParagraph(doc);
          } else {
            outputLanguage(doc, d);
          }
        } else if (p.digestRest && idx >= p.first) {
          outputWork(doc, d, { digest: true });
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
  await writeFile(`${author}-${moment().format('DDMMMYYYY')}.docx`, buffer);
})();
