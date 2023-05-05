/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testMatch: ['<rootDir>/test/All.test.ts'],
	fakeTimers: { enableGlobally: true },
};