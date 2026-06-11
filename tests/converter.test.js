const path = require('path');
const fs = require('fs');
const config = require('../lib/config');
const test = require('@jest/globals').test;
const describe = require('@jest/globals').describe;
const converter = require('../lib/converter');

const sourceDir = './tests/data/source';
const resultDir = './tests/data/result';
const outDir = './tests/data/tmp';

async function compare(file){
  const options = {
    testFile: path.join(sourceDir, file),
    testType: file.split('-').shift(),
    junit: false,
    reportDir: outDir,
  };

  await converter.toFile(options);

  let fileName = file.replace('.xml', '-ctrf.json').replace('.trx', '-ctrf.json');

  let date = new Date();

  let createdReport = fs.readFileSync(path.join(outDir, fileName), 'utf8')
    .replaceAll('\r', '')
    .replace(/"timestamp":.*$/gm, `"timestamp":"${date.toISOString()}"`)
    .replace(/"generatedBy":.*$/gm, `"generatedBy":"ctrf-converter v0.0.0"`)
    .replace(/"version":.*$/gm, `"version":"0.0.0"`)
    .replace(/"start":.*$/gm, `"start":"${date.getTime()}"`)
    .replace(/"stop":.*$/gm, `"stop":"${date.getTime() + 1000}"`)
   ;

  let report = fs.readFileSync(path.join(resultDir, fileName), 'utf8')
    .replaceAll('\r', '')
    .replace(/"timestamp":.*$/gm, `"timestamp":"${date.toISOString()}"`)
    .replace(/"generatedBy":.*$/gm, `"generatedBy":"ctrf-converter v0.0.0"`)
    .replace(/"version":.*$/gm, `"version":"0.0.0"`)
    .replace(/"start":.*$/gm, `"start":"${date.getTime()}"`)
    .replace(/"stop":.*$/gm, `"stop":"${date.getTime() + 1000}"`)
   ;

  expect(createdReport).toBe(report);
}

// describe.each(
//  Array.from(fs.readdirSync(sourceDir).filter(file => file.startsWith('junit')))
// )(
//   "%p",
//   (file) => {
//     test(`${file}`, async() => {
//       await compare(file);
//     });
//   }
// );

describe.each(
 Array.from(fs.readdirSync(sourceDir).filter(file => file.startsWith('junit')))
)('JUnit converter tests', (file) => {
  test(`${file}`, async() => {
     await compare(file);
  });
});

describe.each(
 Array.from(fs.readdirSync(sourceDir).filter(file => file.startsWith('nunit')))
)('NUnit converter tests', (file) => {
  test(`${file}`, async() => {
     await compare(file);
  });
});

describe.each(
 Array.from(fs.readdirSync(sourceDir).filter(file => file.startsWith('trx')))
)('TRX converter tests', (file) => {
  test(`${file}`, async() => {
    await compare(file);
  });
});

describe.each(
 Array.from(fs.readdirSync(sourceDir).filter(file => file.startsWith('xunit')))
)('XUnit converter tests', (file) => {
  test(`${file}`, async() => {
    await compare(file);
  });
});
