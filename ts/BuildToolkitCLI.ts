import fs from 'fs';
import path from 'path';
import { IToolkitRunner } from './Toolkit';
import { IToolkitConfiguration } from './Configuration';
import Arg from './cli/Arg';
import { LoggerConstructor } from './utils/Logger';
import ExitCode from './utils/ExitCode';
import System from './utils/System';
import * as Type from './utils/Type';

export type TRunner = (runner: IToolkitRunner, config: IToolkitConfiguration) => Promise<void>;

export const BuildToolkitCLI = () => {
	const logger = LoggerConstructor();
	const options = Arg.GetOptions();
	const workDir = process.cwd();
	logger.UseLoggerManually();

	System.SetWatching(Type.IsString(options.watch) && !Type.IsEmpty(options.watch));
	System.SetLogging(!System.IsWatching());

	if (!options.config) options.config = path.resolve(workDir, 'build.config.js');
	if (!fs.existsSync(options.config)) return logger.Throw('Configuration file doesn\'t exist');

	import(`${options.config}`)
		.then(runner => {
			const importBuildPath = path.resolve(__dirname, '../../bin', `./build-${System.IsWatching() ? 'watch' : 'run'}`);
			import(`${importBuildPath}`)
				.then(toolkit => {
					const parameters = [runner.default];
					if (System.IsWatching()) parameters.push(options.watch);

					toolkit.default(...parameters);
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		})
		.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
};
