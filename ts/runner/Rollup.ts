import fs from 'fs';
import { InputOptions, OutputOptions, rollup, RollupBuild, RollupOutput } from 'rollup';
import { minify } from 'uglify-js';
import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
import System from '../utils/System';
import { IsArray, IsObject, IsString, IsEmpty } from '../utils/Type';

export interface IOutputOptions extends OutputOptions {
	createUglified?: boolean
}

export interface IRollupOptions extends InputOptions {
	output?: IOutputOptions | IOutputOptions[];
}

export interface IRollupRunner {
	readonly Register: (setting: IRollupOptions | IRollupOptions[]) => void,
	readonly Run: () => Promise<void>
}

const RollupRunner = (): IRollupRunner => {
	const rollupSetting: IRollupOptions[] = [];
	const logger = LoggerConstructor('Rollup');

	const writeBundle = (outputOption: IOutputOptions, value: RollupOutput) => {
		if (IsString(outputOption.file) && outputOption.createUglified) {
			for (const output of value.output) {
				if (output.type !== 'chunk') continue;
				fs.writeFileSync(outputOption.file.replace(/.js$/gi, '.min.js'), minify(output.code).code, 'utf8');
			}
		}
	};

	const bundling = (outputOptions: IOutputOptions[], build: RollupBuild, callback: () => void) => {
		for (const outputOption of outputOptions) {
			const convertedOption = { ...outputOption };
			delete convertedOption.createUglified;

			build.write(convertedOption)
				.then((value) => {
					writeBundle(outputOption, value);
					callback();
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		}
	};

	const runner = (setting: IRollupOptions): Promise<void> => {
		return new Promise((resolve) => {
			const outputOptions: IOutputOptions[] = [];

			if (setting.output) {
				if (IsArray(setting.output)) outputOptions.push(...setting.output);
				else if (IsObject(setting.output))outputOptions.push(setting.output);
				else {
					logger.Throw('Check your rollup output configuration.');
					return Promise.resolve();
				}
			}

			rollup(setting)
				.then(build => bundling(outputOptions, build, resolve))
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	const Register = (setting: IRollupOptions | IRollupOptions[]) => {
		if (IsArray(setting)) {
			rollupSetting.push(...setting);
		} else if (IsObject(setting)) {
			rollupSetting.push(setting);
		} else {
			return logger.Throw('Check your rollup configuration.');
		}
	};

	const Run = (): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (IsEmpty(rollupSetting)) {
			logger.Throw('To run rollup, must register rollup before running.');
			return Promise.resolve();
		}

		logger.Log('Running rollups...');
		logger.Time('All done in', ELogColour.Green);

		return new Promise((resolve) => {
			const rollupList: Promise<void>[] = [];

			for (const setting of rollupSetting) {
				rollupList.push(runner(setting));
			}

			Promise.all(rollupList)
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
				.finally(() => {
					logger.TimeEnd('All done in', ELogColour.Green);
					resolve();
				});
		});
	};

	return {
		Register,
		Run
	};
};

export default RollupRunner();