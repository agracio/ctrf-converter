import * as path from 'path';
import * as fs from 'fs';
import { TestReportConverterOptions, ConverterOptions } from './interfaces';

export enum TestType {
    junit = 'junit',
    nunit = 'nunit',
    xunit = 'xunit',
    trx = 'trx',
}

export class ConfigService {
    static readonly TestType = TestType;

    static config(options: TestReportConverterOptions): ConverterOptions {
        if (!options) {
            throw new Error('options are required.');
        }

        if (!options.testFile) {
            throw new Error("Option 'testFile' is required.");
        }
        if (!fs.existsSync(options.testFile)) {
            throw new Error(`Could not find file ${options.testFile}.`);
        }

        const testFile: string = options.testFile;

        if (!options.testType) {
            throw new Error("Option 'testType' is required.");
        }
        if (!Object.values(TestType).includes(options.testType.toLowerCase() as TestType)) {
            throw new Error(`Test type '${options.testType}' is not supported.`);
        }

        const testType: string = options.testType.toLowerCase();

        let reportDir: string = './report';
        let reportFile: string = `${path.parse(options.testFile).name}-ctrf.json`;
        let saveIntermediateFiles: boolean = false;
        let splitByClassname: boolean = false;
        let junit: boolean = false;
        let junitReportFile: string = `${path.parse(options.testFile).name}-junit.xml`;

        if (options.saveIntermediateFiles === true || options.saveIntermediateFiles === 'true') {
            saveIntermediateFiles = true;
        }

        if (options.splitByClassname === true || options.splitByClassname === 'true') {
            splitByClassname = true;
        }

        if (options.reportDir) {
            reportDir = options.reportDir;
        }

        if (options.reportFile) {
            reportFile = options.reportFile;
        }

        if (options.junit === true || options.junit === 'true') {
            junit = true;
        }

        if (options.junitReportFile) {
            junitReportFile = options.junitReportFile;
        }

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, {recursive: true});
        }

        return {
            testFile: testFile,
            testType: testType,
            reportDir: reportDir,
            reportPath: path.join(reportDir, reportFile),
            reportFile: reportFile,
            junit: junit,
            junitReportFile: junitReportFile,
            splitByClassname: splitByClassname,
            saveIntermediateFiles: saveIntermediateFiles,
        };
    }
}

export const config = ConfigService.config;

//export default { config, TestType: ConfigService.TestType };
