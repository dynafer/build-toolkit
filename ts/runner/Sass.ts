import fs from 'fs';
import path from 'path';
import sass, { Options } from 'sass';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import System from '../utils/System';
import * as Type from '../utils/Type';

export interface ISassSetting {
	input: string,
	output: string,
	compressed?: boolean,
}

export interface ISassRunner {
	readonly Run: (setting: ISassSetting | ISassSetting[]) => void,
}

const SassRunner = (): ISassRunner => {
	const logger = LoggerConstructor('SASS');

	const runner = (setting: ISassSetting, current?: number, total?: number): Promise<void> => {
		if (!Type.IsString(setting.input) || !Type.IsString(setting.output)) {
			logger.Throw('Input and output must be a string.');
			return Promise.resolve();
		}

		logger.Log(`Compiling ${setting.input} to ${setting.output}`);
		const timer = logger.Time();

		return new Promise((resolve) => {
			const inputPath = setting.input;
			const combinedPath = path.resolve(Config.BasePath, setting.input);
			if (!fs.existsSync(inputPath) && !fs.existsSync(combinedPath)) {
				logger.Throw(`${inputPath} doesn't exist.`);
				return resolve();
			}

			const sassOption: Options<'sync'> = {};
			if (setting.compressed) sassOption.style = 'compressed';

			const compiled = sass.compile(fs.existsSync(inputPath) ? inputPath : combinedPath, sassOption);
			fs.writeFile(setting.output, compiled.css, 'utf8', (error) => {
				if (error) return logger.Throw(error, ExitCode.FAILURE.UNEXPECTED);

				logger.TimeEnd(timer, `Compiled ${setting.input} to ${setting.output} in`, ELogColour.Green, current, total);
				return resolve();
			});
		});
	};

	const Run = (settings: ISassSetting | ISassSetting[]): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!Type.IsArray(settings) && !Type.IsObject(settings)) {
			logger.Throw('Setting must be a key-value object.');
			return Promise.resolve();
		}

		let timer = '';

		if (Type.IsArray(settings)) {
			logger.Log('Compiling all the files...');
			timer = logger.Time();
		}

		return new Promise((resolve) => {
			if (!Type.IsArray(settings)) {
				if (!Type.IsObject(settings)) {
					logger.Throw('Setting must be a key-value object.');
					return resolve();
				}

				return runner(settings)
					.then(() => resolve())
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
			}

			const sassList: Promise<void>[] = [];
			for (let index = 0, length = settings.length; index < length; ++index) {
				const setting = settings[index];
				if (!Type.IsObject(setting)) {
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