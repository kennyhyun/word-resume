# Word resume generator

Generate docx resume from yaml data using [docx](https://github.com/dolanmiu/docx)

* Avoid hassles like updating dates and focus on the contents.
* Generate Uptodate resume instantly
* Pdf conversion is also handy when you use libre office cli
* manage the source file with your everday editor
* multiple revison (wip)

** pretty much experimental yet

## Usage

### git clone

After cloning this repo,
```
$ npm i
$ npm run output -- sample.yml
```

### npm (recommended)

```
$ npm install render-resume -g
$ generate-resume-source resume.yml
$ render-resume resume.yml
```

### Programmatic

npm install

```
$ npm i render-resume -S
```

in js

```
import docx from 'docx';
import fs from 'fs';
import render from 'render-resume';
import seeder from 'render-resume/lib/seeder';

const doc = render(seeder('some-random-seed'));
const packer = new docx.Packer();
const buffer = await packer.toBuffer(doc);
fs.writeFile('filename.docx', buffer);
```

## Yaml source format

### header

provides meta data.

#### paragraphs

`paragraphs.$.source` has data key.
`paragraphs.$.title` has the title of the paragraph.

paragraphs in the data are rendered by this order.

#### focusOn

Any data field name can have default key and override by the contents of the default.
If focusOn has been provided, find focusOn key first, and use it if exists.


### data

please refer to [sample.yml](sample.yml)


## Todos

- [x] add test script
- [x] convert to npm library
- [x] publish npm v0.9.2
- [ ] add template to change styles

## Note

- Confirmed working with node version 8
- Use nvm if you want to test without upgrading your system node

