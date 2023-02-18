const moment = require('moment');
const forEach = require('lodash/forEach');
const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const docx = require('docx');
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
  const p = createParagraph([data.company, ` -- ${data.location}`, `; ${data.field}`], { br: false, boldFirst: true });
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

class Parser {
  constructor(data, context = '') {
    this._context = context;
    Object.assign(this, data);
  }

  getByContext(target) {
    if (target.default) {
      if (this._context) {
        return target[this._context] || target.default;
      }
      return target.default;
    }
    return target;
  }

  get(path) {
    const target = get(this, path, {});
    if (Array.isArray(target)) {
      return target;
    }
    return this.getByContext(target);
  };
}

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
const generateDocument = (source, styles, now = new Date()) => {
  const s = source;
  const { author, title, description, focusOn = '' } = s.header;
  const doc = new docx.Document({ author, title, description, externalStyles: styles }, { top: 100, right: 1200 });

  const footer = doc.Footer.createParagraph().right();
  const pageNumber = new docx.TextRun(`${author} -- ${moment(now).format('DD MMM YYYY')} -- `).pageNumber();
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
        if (!p.first || idx < (p.first + hidden)) {
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
        } else if (p.digestRest && idx >= (p.first + hidden)) {
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

// cli
if (process.argv[1] === __filename) {
  (async () => {
    const fs = require('fs');
    const { promisify } = require('util');
    const yaml = require('js-yaml');

    const [,,inputFile] = process.argv;
    const readFile = promisify(fs.readFile);
    const writeFile = promisify(fs.writeFile);

    const styles = await readFile('./styles.xml', 'utf-8');
    const s = yaml.load(await readFile(inputFile || './resume2018.yml'));
    const doc = generateDocument(s, styles);
    const packer = new docx.Packer();
    const buffer = await packer.toBuffer(doc);
    const { author } = s.header;
    await writeFile(`${author}-${moment().format('DDMMMYYYY')}.docx`, buffer);
  })();
}

module.exports = generateDocument;
