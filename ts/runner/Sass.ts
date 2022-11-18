import fs from 'fs';
import sass, { Options } from 'sass';
import path from 'path';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
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

	const runner = (setting: ISassSetting): Promise<void> => {
		if (!Type.IsString(setting.input) || !Type.IsString(setting.output)) {
			logger.Throw('Input and output must be a string');
			return Promise.resolve();
		}
		logger.Log(`Compiling ${setting.input} to ${setting.output}`);
		logger.Time(`Compiled ${setting.input} to ${setting.output} in`, ELogColour.Green);

		return new Promise((resolve) => {
			const inputPath = setting.input;
			const combinedPath = path.resolve(Config.BasePath, setting.input);
			if (!fs.existsSync(inputPath) && !fs.existsSync(combinedPath)) {
				logger.Throw(`${inputPath} doesn't exist.`);
				return resolve();
			}

			const sassOption: Options<'async'> = {};
			if (setting.compressed) sassOption.style = 'compressed';

			sass.compileAsync(fs.existsSync(inputPath) ? inputPath : combinedPath, sassOption)
				.then(value => {
					fs.writeFile(setting.output, value.css, 'utf8', (error) => {
						if (error) return logger.Throw(error, ExitCode.FAILURE.UNEXPECTED);

						logger.TimeEnd(`Compiled ${setting.input} to ${setting.output} in`, ELogColour.Green);
						resolve();
					});
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	const Run = (settings: ISassSetting | ISassSetting[]): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!Type.IsArray(settings) && !Type.IsObject(settings)) {
			logger.Throw('Setting must be a key-value object');
			return Promise.resolve();
		}

		if (Type.IsArray(settings)) {
			logger.Log('Compiling all the files...');
			logger.Time('All done in', ELogColour.Green);
		}

		return new Promise((resolve) => {
			if (Type.IsArray(settings)) {
				const sassList: Promise<void>[] = [];
				for (const setting of settings) {
					if (!Type.IsObject(setting)) {
						logger.Throw('Setting must be a key-value object');
						return resolve();
					}

					sassList.push(runner(setting));
				}

				Promise.all(sassList)
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
					.finally(() => {
						sassList.splice(0, sassList.length);
						logger.TimeEnd('All done in', ELogColour.Green);
						resolve();
					});
			} else {
				if (!Type.IsObject(settings)) {
					logger.Throw('Setting must be a key-value object');
					return resolve();
				}

				runner(settings)
					.then(() => resolve())
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
			}
		});
	};

	return {
		Run
	};
};

export default SassRunner();