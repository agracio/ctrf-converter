## Test report files to CTRF JSON converter

### Overview

- Convert test report files to CTRF JSON format.

### Supported report formats

- JUnit/xUnit XML Format  
- NUnit v3+ XML Format  
- xUnit.net v2+ XML Format  
- MSTest TRX Format (this is default `dotnet test` report output)  

### Conversion process

 - All test reports except are first converted to JUnit format using [junit-converter](https://github.com/agracio/junit-converter).
 - Set `junit` option to `true` to get JUnit conversion results. Not supported for CTRF resports.
 - If you only require JUnit conversion use [junit-converter](https://github.com/agracio/junit-converter).
 - Resulting JUnit output is then converted to CTRF.

 ### Conversion process to JUnit

- **Full conversion process is described in [junit-converter](https://github.com/agracio/junit-converter)**