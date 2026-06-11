declare module 'ctrf-converter'{
    interface TestReportConverterOptions {
        testFile: string
        testType: string
        reportDir? : string
        /**
         * @deprecated Use reportFile instead.
         */
        reportFilename? : string
        reportFile? : string
        splitByClassname?: boolean
        minify?: boolean
        saveIntermediateFiles?: boolean
    }

    interface CtrfReport {
        reportFormat: "CTRF";
        specVersion: `${number}.${number}.${number}`;
        reportId?: string;
        timestamp?: string;
        generatedBy?: string;
        results: Results;
        insights?: RootInsights;
        baseline?: Baseline;
        extra?: Record<string, unknown>;
    }

    interface Results {
        tool: Tool;
        summary: Summary;
        tests: Test[];
        environment?: Environment;
        extra?: Record<string, unknown>;
    }

    interface Summary {
        tests: number;
        passed: number;
        failed: number;
        skipped: number;
        pending: number;
        other: number;
        flaky?: number;
        suites?: number;
        start: number;
        stop: number;
        duration?: number;
        extra?: Record<string, unknown>;
    }

    interface Test {
        id?: string;
        name: string;
        status: TestStatus;
        duration: number;
        start?: number;
        stop?: number;
        suite?: string[];
        message?: string;
        trace?: string;
        snippet?: string;
        line?: number;
        ai?: string;
        rawStatus?: string;
        tags?: string[];
        type?: string;
        filePath?: string;
        retries?: number;
        retryAttempts?: RetryAttempt[];
        flaky?: boolean;
        stdout?: string[];
        stderr?: string[];
        threadId?: string;
        attachments?: Attachment[];
        browser?: string;
        device?: string;
        screenshot?: string;
        parameters?: Record<string, unknown>;
        steps?: Step[];
        insights?: TestInsights;
        extra?: Record<string, unknown>;
    }

    interface Environment {
        reportName?: string;
        appName?: string;
        appVersion?: string;
        buildId?: string;
        buildName?: string;
        buildNumber?: number;
        buildUrl?: string;
        repositoryName?: string;
        repositoryUrl?: string;
        commit?: string;
        branchName?: string;
        osPlatform?: string;
        osRelease?: string;
        osVersion?: string;
        testEnvironment?: string;
        extra?: Record<string, unknown>;
    }

    interface Tool {
        name: string;
        version?: string;
        extra?: Record<string, unknown>;
    }

    interface Step {
        name: string;
        status: TestStatus;
        extra?: Record<string, unknown>;
    }

    interface Attachment {
        name: string;
        contentType: string;
        path: string;
        extra?: Record<string, unknown>;
    }

    interface RetryAttempt {
        attempt: number;
        status: TestStatus;
        duration?: number;
        message?: string;
        trace?: string;
        line?: number;
        snippet?: string;
        stdout?: string[];
        stderr?: string[];
        start?: number;
        stop?: number;
        attachments?: Attachment[];
        extra?: Record<string, unknown>;
    }

    interface RootInsights {
        runsAnalyzed?: number;
        passRate?: InsightsMetric;
        failRate?: InsightsMetric;
        flakyRate?: InsightsMetric;
        averageRunDuration?: InsightsMetric;
        p95RunDuration?: InsightsMetric;
        averageTestDuration?: InsightsMetric;
        extra?: Record<string, unknown>;
    }

    interface TestInsights {
        passRate?: InsightsMetric;
        failRate?: InsightsMetric;
        flakyRate?: InsightsMetric;
        averageTestDuration?: InsightsMetric;
        p95TestDuration?: InsightsMetric;
        executedInRuns?: number;
        extra?: Record<string, unknown>;
    }

    interface InsightsMetric {
        current: number;
        baseline: number;
        change: number;
    }

    interface Baseline {
        reportId: string;
        source?: string;
        timestamp?: string;
        commit?: string;
        buildName?: string;
        buildNumber?: number;
        buildUrl?: string;
        extra?: Record<string, unknown>;
    }

    type TestStatus = "passed" | "failed" | "skipped" | "pending" | "other";
    /**
     * Convert test report to CTRF JSON and write to file async.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<void>}
     */
    function toFile(options: TestReportConverterOptions): Promise<void>;

    /**
     * Convert test report to CTRF JSON and return as JSON object.
     *
     * @param {TestReportConverterOptions} options
     * @return {Promise<CtrfReport>}
     */
    function toJson(options: TestReportConverterOptions): Promise<CtrfReport>;
}