# Word resume generator

Generate docx resume from yaml data

* Avoid hassles like updating dates and focus on the contents.
* Generate Uptodate resume instantly
* Pdf conversion is also handy when you use libre office cli
* manage the source file with your everday editor
* multiple revison (wip)

** pretty much experimental yet

## Usage

```
$ node index.js sample.yml
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

- [ ] add test script
- [ ] convert to npm library
- [ ] add template to change styles

## Note

- Confirmed working with node version 8
- Use nvm if you want to test without upgrading your system node

