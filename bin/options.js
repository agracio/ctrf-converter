export const yargsOptions = {
    testFile: {
        describe: 'Path to test file',
        string: true,
        default: undefined,
    },
    testType: {
        describe: 'Test type',
        string: true,
        default: undefined,
    },
    reportDir: {
        default: './report',
        describe: 'Report output directory',
        string: true,
    },
    reportFile: {
        default: undefined,
        describe: 'CTRF json report file name',
        string: true,
    },
    junit: {
        default: false,
        describe: 'Create JUnit XML report?',
        boolean: true,
    },
    junitReportFile: {
        describe: 'JUnit report file name',
        string: true,
        default: undefined,
    },
    splitByClassname: {
        default: false,
        describe: 'Split into multiple test suites by test classname',
        boolean: true,
    },
};