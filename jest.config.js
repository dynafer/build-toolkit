/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testMatch: ['<rootDir>/test/All.test.ts'],
	testEnvironment: 'jest-environment-node-single-context',
	testTimeout: 10000,
};