## Test report files to CTRF JSON converter

[![Actions Status][github-img]][github-url]

### Overview

- Convert test report files to CTRF JSON format.

### Supported report formats

- JUnit/xUnit XML Format  
- NUnit v3+ XML Format  
- xUnit.net v2+ XML Format  
- MSTest TRX Format (this is default `dotnet test` report output)  

### Conversion process

 - All test reports are first converted to JUnit format using [junit-converter](https://github.com/agracio/junit-converter).
 - Set `junit` option to `true` to get JUnit conversion results.
 - If you only require JUnit conversion use [junit-converter](https://github.com/agracio/junit-converter).

### CTRF conversion from JUnit

- Converts &lt;properties&gt; to CTRF `parameters`.
- Converts &lt;system-out&gt; to CTRF `stdout`.
- Converts &lt;system-err&gt; to CTRF `stderr`.
- Converts &lt;skipped&gt; message to CTRF `stdout`.
- Converts &lt;failure&gt; to CTRF `message` and `trace`.  

 ### Conversion process to JUnit

- **Full conversion process is described in [junit-converter](https://github.com/agracio/junit-converter)**

### Usage

```bash
npm i --save-dev ctrf-converter
```

```js
const converter = require('ctrf-converter');

let options = {
    testFile: 'mytesfiles/nunit.xml',
    testType: 'nunit'
}

// Convert test report to CTRF format and save to file
converter.toFile(options).then(() => console.log(`CTRF report created`));

// Convert test report to CTRF format and return as JSON object for processing
converter.toJson(options).then((result) =>{/*do something with result*/});
```

### CLI via NPX

```bash
npx --yes ctrf-converter --testFile mytests/nunit.xml --testType nunit 
```

### CLI using global module

```bash
npm i -g ctrf-converter
ctrf-converter --testFile mytests/nunit.xml --testType nunit
```

### Options

| Option                    | Type    | Default                   | Description                                       |
|:--------------------------|:--------|:--------------------------|:--------------------------------------------------|
| `testFile` **(required)** | string  |                           | Path to test file for conversion                  |
| `testType` **(required)** | string  |                           | [Test report type](#supported-testtype-options)   |
| `reportDir`               | string  | ./report                  | Converted report output path when saving file     |
| `reportFile`              | string  | `testFile.name`-ctrf.json | CTRF report file name                             |
| `junit`                   | boolean | false                     | Create JUnit report?                              |
| `junitReportFile`         | string  | `testFile.name`-junit.xml | JUnit report file name                            |
| `splitByClassname`        | boolean | false                     | Split into multiple test suites by test classname |

- `testFile` - relative or absolute path to input test file.  

- `testType` - type of test report, not case-sensitive.  

- `reportDir` - will be created if path does not exist. Only used when saving to file.  

- `reportFile` - JUnit file name. Only used when saving to file.  

- `splitByClassname` - If true splits test cases into multiple test suites by classname.  
  This is useful for test runners that generate tests under a single test suite such as `dotnet test` when using JUnit loggers.  
  Should only be set to true if test report file contains single test suite.
  TRX report files are always split by classname, so this option is ignored for TRX files.  

#### Supported `testType` options.

| `testType` | File Type                  |
|:-----------|:---------------------------|
| JUnit      | JUnit/xUnit XML            |
| NUnit      | NUnit v3+ XML              |
| xUnit      | xUnit.net v2+ XML          |
| TRX        | MSTest TRX (`dotnet test`) |


[github-img]: https://github.com/agracio/ctrf-converter/workflows/Test/badge.svg
[github-url]: https://github.com/agracio/ctrf-converter/actions/workflows/main.yml