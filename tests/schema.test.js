const path = require('path');
const fs = require('fs');
const Ajv = require("ajv")
const config = require('../lib/config');
const test = require('@jest/globals').test;
const describe = require('@jest/globals').describe;

const sourceDir = './tests/data/source';
const resultDir = './tests/data/result';

describe.each(
  Array.from(fs.readdirSync(resultDir).map(file => file))
)('CTRF schema validation', (file) => {
  test(`${file}`, async() => {
    const report = JSON.parse(fs.readFileSync(path.join(resultDir, file), 'utf8'));
    const ajv = new Ajv();
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './data/ctrf-schema.json'), 'utf8'));
    const validate = ajv.compile(schema);
    const valid = validate(report);
    let message = `File ${file} does not conform to CTRF schema: ${JSON.stringify(validate.errors, null, 2)}`;
    expect(valid, message).toBe(true);
  });
});
