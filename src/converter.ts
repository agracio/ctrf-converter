import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from './config.js';
import { TestReportConverterOptions, ConverterOptions } from './interfaces.js';
import { CtrfReport, Summary, Tool, Test} from './ctrf.js';
import { toJson as junitToJson, toFile as junitToFile, TestSuites as JunitReport } from 'junit-converter';

/**
 * Main converter service for test reports to JUnit XML
 */
export class Converter {

    private async convert(options: ConverterOptions): Promise<Partial<CtrfReport>> {

        const junitConvertOptions = {
            testFile: options.testFile,
            testType: options.testType,
            reportDir: options.reportDir,
            reportFile: options.junitReportFile,
            splitByClassname: options.splitByClassname || options.testType === 'trx',
            saveIntermediateFiles: options.saveIntermediateFiles,
        };

        let result: Partial<CtrfReport> = {};

        if(options.junit) {
            await junitToFile(junitConvertOptions);
        }

        const report: JunitReport = await junitToJson(junitConvertOptions);

        if (!report || !report.testsuites || report.testsuites.length === 0 || !report.testsuites[0].testsuite || report.testsuites[0].testsuite.length === 0) {
            console.error(`Failed to convert test report ${options.testFile} to JSON. No testsuites found.`);
        }
        
        let testsuites = report.testsuites[0];

        const timestamp = testsuites.timestamp ? new Date(testsuites.timestamp) : new Date();

        let tool: Tool = {
            name: 'ctrf-converter',
            version: require('../package.json').version,
        };


        let failures = Number(testsuites.failures) + Number(testsuites.errors ?? 0);
        let skipped = Number(testsuites.skipped);
        let calcDuration = !testsuites.time || testsuites.time == 0;
        let duration = calcDuration ? 0 : Number(testsuites.time) * 1000;

        let tests: Test[] = [];

        testsuites.testsuite.forEach(testsuite => {

            testsuite.testcase.forEach(testcase => {

                let status: any = 'passed';
                if (testcase.failure) {
                    status = 'failed';
                } else if (testcase.skipped) {
                    status = 'skipped';
                }

                if(calcDuration) {
                    duration += Number(testcase.time) * 1000; // if duration is not provided, assume 1 second per test
                }

                let test: Test = {
                    name: testcase.name,
                    status: status,
                    duration: Math.ceil(Number(testcase.time) * 1000),
                    suite: [testsuite.name],
                };

                if(testcase.properties && testcase.properties.length !== 0) {
                    testcase.properties.forEach((property: any) => {
                        if(property.property && property.property.length !== 0) {
                            property.property.forEach((p: any) => {
                                if (p.name && p.value) {
                                    if (!test.parameters) {
                                        test.parameters = {};
                                    }
                                    test.parameters[p.name] = p.value;
                                }
                            });
                        }
                    });
                }

                if (testcase.failure && testcase.failure.length !== 0) {

                    test.message = testcase.failure[0].message;
                    test.trace = testcase.failure[0].$t;
                }

                if (testcase.error && testcase.error.length !== 0) {
                    test.message = testcase.error[0].message;
                    test.trace = testcase.error[0].$t;
                }

                if (testcase['system-out']) {
                    test.stdout = Array.isArray(testcase['system-out']) ? testcase['system-out'].map((o: any) => o.$t) : [testcase['system-out'].$t];
                }
                if (testcase['system-err']) {
                    test.stderr = Array.isArray(testcase['system-err']) ? testcase['system-err'].map((o: any) => o.$t) : [testcase['system-err'].$t];
                }

                if(testcase.skipped && testcase.skipped.length !== 0 && testcase.skipped[0].message) {
                    if(test.stdout && test.stdout.length > 0) {
                        let message = test.stdout[0].replaceAll('\n', ' ').toLowerCase();
                        if(message != testcase.skipped[0].message.toLowerCase()) {
                            test.stdout.push(testcase.skipped[0].message);
                        }
                        if(testcase.skipped[0].$t) {
                            test.stdout.push(testcase.skipped[0].$t);
                        }
                    }
                    else{
                        test.stdout = [testcase.skipped[0].message];
                    }
                }                

                tests.push(test);

                // if (!testcase.classname && testsuite.classname) {
                //     testcase.classname = testsuite.classname;
                // }
            });
        });

        const summary: Summary = {
            tests: Number(testsuites.tests),
            passed: Number(Number(testsuites.tests) - failures - skipped),
            failed: failures,
            skipped: skipped,
            pending: 0,
            other: 0,
            start: timestamp.getTime(),
            stop: Math.ceil(timestamp.getTime() + duration),
            suites: Number(testsuites.testsuite.length),
            duration: Math.ceil(duration),
        };

        result = {
            reportFormat: "CTRF",
            specVersion: "0.0.0",
            generatedBy: `ctrf-converter v${tool.version}`,
            timestamp: timestamp.toISOString(),
            results: {
                tool: tool,
                summary: summary,
                tests: tests,
            },
        };

        return result;
    }

    /**
     * Convert test report to JUnit XML and write to file async
     * @param options Converter configuration
     * @throws {Error} If conversion or file writing fails
     */
    async toFile(options: TestReportConverterOptions): Promise<ConverterOptions> {
        const config = ConfigService.config(options);

        const result = await this.convert(config);
        fs.writeFileSync(path.join(config.reportDir, config.reportFile), JSON.stringify(result, null, 2), 'utf8');
        return config;
    }

    /**
     * Convert test report to JUnit and parse as JSON object
     * @param {TestReportConverterOptions} options Converter configuration
     * @returns {Promise<TestSuites>} Async parsed JSON object
     * @throws {Error} If conversion or JSON parsing fails
     */
    async toJson(options: TestReportConverterOptions): Promise<Partial<CtrfReport>> {
        const config = ConfigService.config(options);
        return this.convert(config);
    }
}

// Create singleton instance for backward compatibility
const converter = new Converter();

// Export instance methods for backward compatibility
export const toFile = (options: TestReportConverterOptions): Promise<ConverterOptions> => converter.toFile(options);
export const toJson = (options: TestReportConverterOptions): Promise<Partial<CtrfReport>> => converter.toJson(options);

// Default export for CommonJS consumers
export default {
    toFile,
    toJson,
    Converter: Converter,
};
