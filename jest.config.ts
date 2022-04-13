import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts"],
	coverageDirectory: 'coverage',
	setupFilesAfterEnv: ['<rootDir>/jest-setup.ts']
}

export default config
