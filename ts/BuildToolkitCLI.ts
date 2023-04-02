import fs from 'fs';
import path from 'path';
import Arg from './cli/Arg';
import { Run } from './cli/Run';
import { Watch } from './cli/Watch';
import { IToolkitConfiguration } from './Configuration';
import { IToolkitRunner } from './Toolkit';
import ExitCode from './utils/ExitCode';
import { LoggerConstructor } from './utils/Logger';
import PathUtils from './utils/PathUtils';
import System from './utils/System';
import * as Type from './utils/Type';

export type TRunner = (runner: IToolkitRunner, config: IToolkitConfiguration) => Promise<void>;

export const BuildToolkitCLI = () => {
	const logger = LoggerConstructor();
	const options = Arg.GetOptions();

	System.SetWatching(Type.IsString(options.watch) && !Type.IsEmpty(options.watch));
	System.SetLogging(!System.IsWatching());

	if (!options.config) options.config = 'build.config.js';
	if (!fs.existsSync(options.config)) return logger.Throw('Configuration file doesn\'t exist.');
	options.config = path.resolve(PathUtils.WorkDir, options.config);

	import(`${options.config}`)
		.then(runner => {
			const toolkit = System.IsWatching() ? Watch : Run;

			toolkit(runner.default, options.watch);
		})
		.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
};
