import { watch } from 'chokidar';
import fs from 'fs';
import path from 'path';
import { IToolkit } from '../Toolkit';
import { TRunner } from '../BuildToolkitCLI';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
import System from '../utils/System';
import * as Type from '../utils/Type';

export interface IWatcher {
	Register: (toolkit: IToolkit, runner: TRunner) => void,
}

export const Watcher = (): IWatcher => {
	const logger = LoggerConstructor('Watcher');
	logger.UseLoggerManually();

	const watchPath = fs.existsSync(Config.WatchDir) ? Config.WatchDir : path.resolve(Config.BasePath, Config.WatchDir);
	if (!fs.existsSync(watchPath)) logger.Throw('Directory to watch doesn\'t exist');
	let lastChanged: number;
	let bWorking: boolean = false;
	let toolkitInstance: IToolkit;
	let runnerInstance: TRunner;

	const logWatching = () => logger.Log('Watching files...', ELogColour.Green);

	const update = async (currentChanged: number) => {
		logger.Clear();
		logger.Log('Detected changes and working on the runners...');
		logger.Time('Done', ELogColour.Green);
		await runnerInstance(toolkitInstance.Runner, Config);
		logger.TimeEnd('Done', ELogColour.Green);
		System.SetError(false);

		if (currentChanged < lastChanged) {
			await update(lastChanged);
		} else {
			bWorking = false;
			logWatching();
		}
	};

	const trigger = () => {
		lastChanged = new Date().getTime();

		if (bWorking) return;

		bWorking = true;
		update(lastChanged)
			.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
	};

	const Register = (toolkit: IToolkit, runner: TRunner) => {
		if (!Type.IsObject(toolkit) || !Type.IsFunction(runner)) logger.Throw('Runner must be function');
		toolkitInstance = toolkit;
		runnerInstance = runner;

		watch(watchPath, { ignored: /(build|lib)\//gi, ignoreInitial: true })
			.on('ready', () => logWatching())
			.on('add', (filePath, stats) => {
				if (stats?.size === 0) return;

				return trigger();
			})
			.on('change', () => { if (!bWorking) trigger(); })
			.on('unlink', () => { if (!bWorking) trigger(); })
			.on('error', (error) => logger.Log(`Build-Toolkit error: ${error}`, ELogColour.Red));
	};

	return {
		Register
	};
};