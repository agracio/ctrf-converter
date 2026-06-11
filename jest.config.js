module.exports = {
    verbose: true,
    globalTeardown: "./tests/teardown.js",
    reporters: [
        'default',
        ['github-actions', {silent: false}], 
        'summary',
        ['jest-junit', { suiteName: "ctrf-converter tests" }]
    ],
    testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"],
    collectCoverage: true,
    "collectCoverageFrom": [
        "lib/**/*.js"
    ],
    setupFilesAfterEnv: ['jest-expect-message'],
    coverageDirectory: "coverage",
}