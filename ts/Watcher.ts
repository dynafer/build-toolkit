import { watch } from 'chokidar';
import fs from 'fs';
import path from 'path';
import { TRunner } from './BuildToolkitCLI';
import { Config } from './Configuration';
import { IToolkit } from './Toolkit';
import ExitCode from './utils/ExitCode';
import { ELogColour, LoggerConstructor } from './utils/Logger';
import System from './utils/System';
import * as Type from './utils/Type';

export interface IWatcher {
	Register: (toolkit: IToolkit, runner: TRunner) => void,
}

export const Watcher = (): IWatcher => {
	const logger = LoggerConstructor('Watcher', true);

	const watchPath = fs.existsSync(Config.WatchDir) ? Config.WatchDir : path.resolve(Config.BasePath, Config.WatchDir);
	if (!fs.existsSync(watchPath)) logger.Throw('Directory to watch doesn\'t exist.');

	const MISSAVED_MILLISECONDS = 100;

	let lastChanged: number = new Date().getTime();
	let bWorking: boolean = false;
	let toolkitInstance: IToolkit;
	let runnerInstance: TRunner;

	const logWatching = () => logger.Log('Watching files...', ELogColour.Cyan);

	const isChanged = (time: number): boolean => Math.abs(lastChanged - time) > MISSAVED_MILLISECONDS;

	const update = async (currentChanged: number) => {
		logger.Clear();
		logger.Log('Detected changes and working on the runners...');
		const timer = logger.Time();
		await runnerInstance(toolkitInstance.Runner, Config);
		logger.TimeEnd(timer, 'Done in', ELogColour.Green);
		System.SetError(false);

		if (currentChanged >= lastChanged || !isChanged(currentChanged)) {
			bWorking = false;
			return logWatching();
		}

		await update(lastChanged);
	};

	const trigger = () => {
		const currentTime = new Date().getTime();
		if (lastChanged <= currentTime) lastChanged = currentTime;

		if (bWorking) return;

		bWorking = true;
		update(lastChanged)
			.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
	};

	const Register = (toolkit: IToolkit, runner: TRunner) => {
		if (!Type.IsObject(toolkit) || !Type.IsFunction(runner)) logger.Throw('Runner must be a function.');
		toolkitInstance = toolkit;
		runnerInstance = runner;

		watch(watchPath, { ignored: /(build|lib)\//gi, ignoreInitial: true })
			.on('ready', () => logWatching())
			.on('add', (filePath, stats) => {
				if (stats?.size === 0) return;
				trigger();
			})
			.on('change', trigger)
			.on('unlink', trigger)
			.on('error', (error) => logger.Log(`Build-Toolkit error: ${error}`, ELogColour.Red));
	};

	return {
		Register
	};
};