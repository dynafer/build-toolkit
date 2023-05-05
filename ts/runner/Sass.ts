import fs from 'fs';
import sass, { Options } from 'sass';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import PathUtils from '../utils/PathUtils';
import System from '../utils/System';
import * as Utils from '../utils/Utils';

export interface ISassSetting {
	input: string,
	output: string,
	compressed?: boolean,
}

export interface ISassRunner {
	Run: (setting: ISassSetting | ISassSetting[]) => void,
}

const SassRunner = (): ISassRunner => {
	const logger = LoggerConstructor('SASS');

	const runner = (setting: ISassSetting, current?: number, total?: number): Promise<void> => {
		if (!Utils.IsString(setting.input) || !Utils.IsString(setting.output)) {
			logger.Throw('Input and output must be a string.');
			return Promise.resolve();
		}

		logger.Log(`Compiling ${setting.input} to ${setting.output}`);
		const timer = logger.Time();

		return new Promise(resolve => {
			const inputPath = PathUtils.GetAbsolute(setting.input, Config.BasePath);
			if (!fs.existsSync(inputPath)) {
				logger.Throw(`${inputPath} doesn't exist.`);
				return resolve();
			}

			const sassOption: Options<'sync'> = {};
			if (setting.compressed) sassOption.style = 'compressed';

			const compiled = sass.compile(inputPath, sassOption);
			fs.writeFile(setting.output, compiled.css, 'utf8', error => {
				if (error) return logger.Throw(error, ExitCode.FAILURE.UNEXPECTED);

				logger.TimeEnd(timer, `Compiled ${setting.input} to ${setting.output} in`, ELogColour.Green, current, total);
				return resolve();
			});
		});
	};

	const Run = (settings: ISassSetting | ISassSetting[]): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!Utils.IsArray(settings) && !Utils.IsObject(settings)) {
			logger.Throw('Setting must be a key-value object.');
			return Promise.resolve();
		}

		let timer = '';

		if (Utils.IsArray(settings)) {
			logger.Log('Compiling all the files...');
			timer = logger.Time();
		}

		return new Promise(resolve => {
			if (!Utils.IsArray(settings)) {
				if (!Utils.IsObject(settings)) {
					logger.Throw('Setting must be a key-value object.');
					return resolve();
				}

				return runner(settings)
					.then(resolve)
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
			}

			const sassList: Promise<void>[] = [];
			for (let index = 0, length = settings.length; index < length; ++index) {
				const setting = settings[index];
				if (!Utils.IsObject(setting)) {
					logger.Throw('Setting must be a key-value object.');
					return resolve();
				}

				sassList.push(runner(setting, index + 1, length));
			}

			return Promise.all(sassList)
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
				.finally(() => {
					sassList.splice(0, sassList.length);
					logger.TimeEnd(timer, 'All done in', ELogColour.Green);
					return resolve();
				});
		});
	};

	return {
		Run
	};
};

export default SassRunner();