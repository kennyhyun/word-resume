# Word resume generator

[npm package render-resume](https://www.npmjs.com/package/render-resume)

Generate docx resume from yaml data using [docx](https://github.com/dolanmiu/docx)

Benefits

* Avoid hassles like updating dates and focus on the contents.
* Generate Uptodate resume instantly
* Pdf conversion is also handy when you use libre office cli
* Manage the source file with your everday programming editor
* Track your changes in the private git repo
* Keep multiple revisons using `focusOn` field

** yet experimental

## Usage

### Creating your won repo (recommended)

1. Create a new repo using this as template (recommend private)
1. Clone the repo in your env
1. run `npm i`
1. copy sample.yml into resume.yml in `resume` dir and update to yours
1. run `npm render` to get docx in `output` dir
1. You can commit and push your yml in `resume` dir if you want

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
