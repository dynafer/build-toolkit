import type { Config } from '@jest/types';
import { runCLI as Test } from 'jest';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import PathUtils from '../utils/PathUtils';
import System from '../utils/System';
import * as Utils from '../utils/Utils';

export interface ITestRunner {
	Run: (setting: Config.Argv) => Promise<void>,
}

const TestRunner = (): ITestRunner => {
	const logger = LoggerConstructor('Text');

	const getArgvs = (setting: Config.Argv): Config.Argv => {
		const testSetting = { ...setting };
		if (System.IsWatching()) {
			testSetting.verbose = false;
			testSetting.silent = true;
			testSetting.noStackTrace = true;
			testSetting.reporters = ['jest-silent-reporter'];
		}

		delete testSetting.watch;
		delete testSetting.watchAll;
		delete testSetting.watchman;
		delete testSetting.watchPlugins;

		return testSetting;
	};

	const Run = (setting: Config.Argv): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (!Utils.IsObject(setting)) {
			logger.Throw('Setting must be an object.');
			return Promise.resolve();
		}

		const watch = setting.watch ?? true;
		if (System.IsWatching() && !watch) return Promise.resolve();

		logger.Log('Testing...');
		const timer = logger.Time();

		return new Promise(resolve => {
			Test(getArgvs(setting), [PathUtils.WorkDir])
				.then(({ results }) => {
					for (let index = 0, length = results.testResults.length; index < length; ++index) {
						const result = results.testResults[index];
						if (!Utils.IsObject(result.testExecError)) continue;
						const error = new Error();
						error.message = result.testExecError.message;
						if (result.testExecError.stack) error.stack = result.testExecError.stack;
						throw error;
					}

					logger.TimeEnd(timer, 'Done in', ELogColour.Green);
					return resolve();
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	return {
		Run,
	};
};

export default TestRunner();