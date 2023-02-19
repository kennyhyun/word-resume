import Parser from './parser';

import { createParagraph, appendParagraph, insertBlankParagraph } from './paragraph';

const moment = require('moment');
const forEach = require('lodash/forEach');
const isEmpty = require('lodash/isEmpty');
const docx = require('docx');
const humanize = require('underscore.string/humanize');

const formatDuration = s => {
  const [start, end] = s.split('~');
  const mstart = moment(start.trim(), 'DD MMM YYYY');
  const mend = end && moment(end.trim(), 'DD MMM YYYY');

  return `${mstart.format('MMM YYYY')} ~ ${mend ? mend.format('MMM YYYY') : 'to date'} ${`(${
    (mend || moment()).diff(mstart, 'months') + 1
  } months${mend ? '' : ' ~'})`}`;
};

const outputWork = (doc, data, opt = {}) => {
  const { digest = false } = opt;
  const p = createParagraph([data.company, ` -- ${data.location}`, `; ${data.field}`], {
    br: false,
    boldFirst: true,
  });
  appendParagraph(p, '    ' + formatDuration(data.duration), { boldFirst: !digest });
  appendParagraph(p, `; ${data.title}`, { br: false });
  if (!digest) {
    const achievements = data.get('achievements');
    if (achievements) {
      achievements.forEach(a => appendParagraph(p, '    - ' + a));
    }
    const skills = data.get('skills');
    if (skills && !isEmpty(skills)) {
      appendParagraph(p, '    * Acquired/developed skills:  ');
      appendParagraph(p, skills.join(', '), { br: false });
    }
  }
  doc.addParagraph(p);
};

const outputEducation = (doc, data) => {
  const p = createParagraph([data.title, ` -- ${data.acquisition}`], {
    br: false,
    boldFirst: true,
  });
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

  const p = createParagraph(['', `    ${data.get('carrierSummary')}`, '']);
  const technicalSkills = data.get('technicalSkills');

  if (technicalSkills) {
    forEach(technicalSkills, (v, k) => {
      appendParagraph(p, `    * ${humanize(k)}`);
      appendParagraph(p, `      ${data.getByContext(v).join(', ')}`);
    });
  }
  doc.addParagraph(p);
};

// main OUTPUT
export const generateDocument = (source, styles, now = new Date()) => {
  const s = source;
  const { author, title, description, focusOn = '' } = s.header;
  const doc = new docx.Document(
    { author, title, description, externalStyles: styles },
    { top: 100, right: 1200 }
  );

  const footer = doc.Footer.createParagraph().right();
  const pageNumber = new docx.TextRun(
    `${author} -- ${moment(now).format('DD MMM YYYY')} -- `
  ).pageNumber();
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
      let hidden = 0;
      data.forEach((d, idx) => {
        if (!p.first || idx < p.first + hidden) {
          if (d.company) {
            if (!(d.hideOn || []).includes(focusOn)) {
              outputWork(doc, new Parser(d, focusOn));
              insertBlankParagraph(doc);
            } else {
              hidden++;
            }
          } else if (d.institute) {
            outputEducation(doc, new Parser(d, focusOn));
            insertBlankParagraph(doc);
          } else {
            outputLanguage(doc, d);
          }
        } else if (p.digestRest && idx >= p.first + hidden) {
          outputWork(doc, new Parser(d, focusOn), { digest: true });
        }
      });
    } else {
      outputProfile(doc, new Parser(data, focusOn));
    }
    insertBlankParagraph(doc);
  });

  // doc.document.body.root.forEach(p => console.log(p));
  return doc;
};
