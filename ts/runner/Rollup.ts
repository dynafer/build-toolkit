import fs from 'fs';
import { InputOptions, OutputOptions, rollup, RollupBuild, RollupOutput } from 'rollup';
import { minify } from 'uglify-js';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import System from '../utils/System';
import * as Type from '../utils/Type';

export interface IOutputOptions extends OutputOptions {
	createUglified?: boolean,
}

export interface IRollupOptions extends InputOptions {
	output?: IOutputOptions | IOutputOptions[],
}

export interface IRollupRunner {
	Register: (setting: IRollupOptions | IRollupOptions[]) => void,
	Run: () => Promise<void>,
}

const RollupRunner = (): IRollupRunner => {
	const rollupSetting: IRollupOptions[] = [];
	const logger = LoggerConstructor('Rollup');

	const minifyBundle = (outputOption: IOutputOptions, value: RollupOutput) => {
		if (!Type.IsString(outputOption.file) || !outputOption.createUglified) return;
		for (let index = 0, length = value.output.length; index < length; ++index) {
			const output = value.output[index];
			if (output.type !== 'chunk') continue;
			fs.writeFileSync(outputOption.file.replace(/.js$/gi, '.min.js'), minify(output.code).code, 'utf8');
		}
	};

	const bundle = (outputOptions: IOutputOptions[], build: RollupBuild, callback: () => void) =>
		outputOptions.forEach(outputOption => {
			const convertedOption = { ...outputOption };
			delete convertedOption.createUglified;

			build.write(convertedOption)
				.then(value => {
					minifyBundle(outputOption, value);
					callback();
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});

	const runner = (setting: IRollupOptions): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		return new Promise(resolve => {
			const outputOptions: IOutputOptions[] = [];

			if (setting.output) {
				if (Type.IsArray(setting.output)) outputOptions.push(...setting.output);
				else if (Type.IsObject(setting.output)) outputOptions.push(setting.output);
				else {
					logger.Throw('Check your rollup output configuration.');
					return Promise.resolve();
				}
			}

			return rollup(setting)
				.then(build => bundle(outputOptions, build, resolve))
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	const Register = (setting: IRollupOptions | IRollupOptions[]) => {
		if (Type.IsArray(setting)) return rollupSetting.push(...setting);
		if (Type.IsObject(setting)) return rollupSetting.push(setting);
		logger.Throw('Check your rollup configuration.');
	};

	const Run = (): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (Type.IsEmpty(rollupSetting)) {
			logger.Throw('To run rollup, must register rollup before running.');
			return Promise.resolve();
		}

		logger.Log('Running rollups...');
		const timer = logger.Time();

		return new Promise(resolve => {
			const rollupList: Promise<void>[] = [];

			rollupSetting.forEach(setting => rollupList.push(runner(setting)));

			return Promise.all(rollupList)
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
				.finally(() => {
					rollupList.splice(0, rollupList.length);
					rollupSetting.splice(0, rollupSetting.length);
					logger.TimeEnd(timer, 'All done in', ELogColour.Green);
					return resolve();
				});
		});
	};

	return {
		Register,
		Run
	};
};

export default RollupRunner();