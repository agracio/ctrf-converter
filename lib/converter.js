"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.toFile = exports.Converter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_js_1 = require("./config.js");
const junit_converter_1 = require("junit-converter");
/**
 * Main converter service for test reports to JUnit XML
 */
class Converter {
    async convert(options) {
        const junitConvertOptions = {
            testFile: options.testFile,
            testType: options.testType,
            reportDir: options.reportDir,
            reportFile: options.junitReportFile,
            splitByClassname: options.splitByClassname || options.testType === 'trx',
            saveIntermediateFiles: options.saveIntermediateFiles,
        };
        let result = {};
        if (options.junit) {
            await (0, junit_converter_1.toFile)(junitConvertOptions);
        }
        const report = await (0, junit_converter_1.toJson)(junitConvertOptions);
        if (!report || !report.testsuites || report.testsuites.length === 0 || !report.testsuites[0].testsuite || report.testsuites[0].testsuite.length === 0) {
            console.error(`Failed to convert test report ${options.testFile} to JSON. No testsuites found.`);
        }
        let testsuites = report.testsuites[0];
        const timestamp = testsuites.timestamp ? new Date(testsuites.timestamp) : new Date();
        let tool = {
            name: 'ctrf-converter',
            version: require('../package.json').version,
        };
        let failures = Number(testsuites.failures) + Number(testsuites.errors ?? 0);
        let skipped = Number(testsuites.skipped);
        let calcDuration = !testsuites.time || testsuites.time == 0;
        let duration = calcDuration ? 0 : Number(testsuites.time) * 1000;
        let tests = [];
        testsuites.testsuite.forEach(testsuite => {
            testsuite.testcase.forEach(testcase => {
                let status = 'passed';
                if (testcase.failure) {
                    status = 'failed';
                }
                else if (testcase.skipped) {
                    status = 'skipped';
                }
                if (calcDuration) {
                    duration += Number(testcase.time) * 1000; // if duration is not provided, assume 1 second per test
                }
                let test = {
                    name: testcase.name,
                    status: status,
                    duration: Math.ceil(Number(testcase.time) * 1000),
                    suite: [testsuite.name],
                };
                if (testcase.properties && testcase.properties.length !== 0) {
                    testcase.properties.forEach((property) => {
                        if (property.property && property.property.length !== 0) {
                            property.property.forEach((p) => {
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
                    test.stdout = Array.isArray(testcase['system-out']) ? testcase['system-out'].map((o) => o.$t) : [testcase['system-out'].$t];
                }
                if (testcase['system-err']) {
                    test.stderr = Array.isArray(testcase['system-err']) ? testcase['system-err'].map((o) => o.$t) : [testcase['system-err'].$t];
                }
                if (testcase.skipped && testcase.skipped.length !== 0 && testcase.skipped[0].message) {
                    if (test.stdout && test.stdout.length > 0) {
                        let message = test.stdout[0].replaceAll('\n', ' ').toLowerCase();
                        if (message != testcase.skipped[0].message.toLowerCase()) {
                            test.stdout.push(testcase.skipped[0].message);
                        }
                        if (testcase.skipped[0].$t) {
                            test.stdout.push(testcase.skipped[0].$t);
                        }
                    }
                    else {
                        test.stdout = [testcase.skipped[0].message];
                    }
                }
                tests.push(test);
                // if (!testcase.classname && testsuite.classname) {
                //     testcase.classname = testsuite.classname;
                // }
            });
        });
        const summary = {
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
    async toFile(options) {
        const config = config_js_1.ConfigService.config(options);
        const result = await this.convert(config);
        fs.writeFileSync(path.join(config.reportDir, config.reportFile), JSON.stringify(result, null, 2), 'utf8');
    }
    /**
     * Convert test report to JUnit and parse as JSON object
     * @param {TestReportConverterOptions} options Converter configuration
     * @returns {Promise<TestSuites>} Async parsed JSON object
     * @throws {Error} If conversion or JSON parsing fails
     */
    async toJson(options) {
        const config = config_js_1.ConfigService.config(options);
        return this.convert(config);
    }
}
exports.Converter = Converter;
// Create singleton instance for backward compatibility
const converter = new Converter();
// Export instance methods for backward compatibility
const toFile = (options) => converter.toFile(options);
exports.toFile = toFile;
const toJson = (options) => converter.toJson(options);
exports.toJson = toJson;
// Default export for CommonJS consumers
exports.default = {
    toFile: exports.toFile,
    toJson: exports.toJson,
    Converter: Converter,
};
//# sourceMappingURL=converter.js.map