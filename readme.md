# Word resume generator

[npm package render-resume](https://www.npmjs.com/package/render-resume)

Generate docx resume from yaml data using [docx](https://github.com/dolanmiu/docx)

* Avoid hassles like updating dates and focus on the contents.
* Generate Uptodate resume instantly
* Pdf conversion is also handy when you use libre office cli
* manage the source file with your everday editor
* multiple revison (wip)

** pretty much experimental yet

## Usage

### npm (recommended)

in a blank directory

```
$ git init
$ npm init --yes
$ npm install -S render-resume
$ npx generate-resume-source resume.yml
$ git add . && git commit -m "init"
```

edit the yaml file for your resume and render

```
$ npx render-resume resume.yml
```

repeat editing and render until you want and you can commit and keep your own yaml in the local repo

### git clone

After cloning this repo,
```
$ npm i
$ npm run render sample.yml
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
import render, { seeder } from 'render-resume';

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
- [ ] add using custom style.xml
- [ ] add template to change styles

## Screen shot

![sample](https://user-images.githubusercontent.com/5399854/47976379-42b4d200-e106-11e8-800c-4f41ddebb14b.png)
