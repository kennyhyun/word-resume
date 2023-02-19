import { TextRun, Paragraph } from 'docx';

export const createParagraph = (contents, opt = {}) => {
  const paragraph = new Paragraph();
  let line;
  if (Array.isArray(contents)) {
    line = contents[0];
  } else {
    line = contents;
  }
  const { br = true, boldFirst = false } = opt;
  const putBold = t => (boldFirst ? t.bold() : t);
  const putBreak = t => (br ? t.break() : t);
  paragraph.addRun(putBold(new TextRun(line)));
  if (Array.isArray(contents) && contents.length >= 1) {
    contents.slice(1).forEach(str => {
      paragraph.addRun(putBreak(new TextRun(str)));
    });
  }
  return paragraph;
};

export const appendParagraph = (p, contents, opt = {}) => {
  const { br = true, boldFirst = false } = opt;
  const putBold = t => (boldFirst ? t.bold() : t);
  const putBreak = t => (br ? t.break() : t);
  if (Array.isArray(contents)) {
    p.addRun(putBold(putBreak(new TextRun(contents[0]))));
    contents.slice(1).forEach(str => {
      p.addRun(putBreak(new TextRun(str)));
    });
  } else {
    p.addRun(putBreak(putBold(new TextRun(contents))));
  }
};

export const insertBlankParagraph = doc => {
  const p = createParagraph('');
  doc.addParagraph(p);
};
