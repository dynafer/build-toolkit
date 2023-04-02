import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import System from '../utils/System';
import { IsArray, IsObject, IsString } from '../utils/Type';

export interface ICommandSetting {
	cd?: string,
	watch?: boolean,
	command: string,
}

export interface ICommandRunner {
	readonly Run: (setting: ICommandSetting | ICommandSetting[]) => void,
}

const CommandRunner = (): ICommandRunner => {
	const logger = LoggerConstructor('Command');

	const runner = (setting: ICommandSetting, bLogTime: boolean = true, current?: number, total?: number): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!IsString(setting.command)) {
			logger.Throw('Command must be a string.');
			return Promise.resolve();
		}
		logger.Log(`Executing ${setting.command}`);

		const timer = !bLogTime ? '' : logger.Time();

		return new Promise(resolve => {
			const commands: string[] = [];
			if (setting.cd) {
				if (!IsString(setting.cd)) {
					logger.Throw('Cd must be a string.');
					return resolve();
				}
				const workDir = setting.cd;
				const combinedPath = path.resolve(Config.BasePath, workDir);
				if (!fs.existsSync(workDir) && !fs.existsSync(combinedPath)) {
					logger.Throw(`${workDir} doesn't exist.`);
					return resolve();
				}

				commands.push(`cd ${fs.existsSync(workDir) ? workDir : combinedPath}`);
			}

			commands.push(setting.command);

			exec(commands.join(' && '), (error, stdout, stderr) => {
				if (error || stderr) {
					logger.Throw(error ?? stderr, ExitCode.FAILURE.UNEXPECTED);
					return resolve();
				}

				commands.splice(0, commands.length);
				if (bLogTime) logger.TimeEnd(timer, 'Done in', ELogColour.Green, current, total);
				return resolve();
			});
		});
	};

	const Run = (settings: ICommandSetting | ICommandSetting[]): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!IsArray(settings) && !IsObject(settings)) {
			logger.Throw('Check your rollup configuration.');
			return Promise.resolve();
		}

		let timer = '';

		if (IsArray(settings)) {
			logger.Log('Executing commands...');
			timer = logger.Time();
		} else if (System.IsWatching() && !(settings.watch ?? true)) {
			return Promise.resolve();
		}

		return new Promise(resolve => {
			if (!IsArray(settings)) {
				return runner(settings)
					.then(resolve)
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
			}

			const execList: Promise<void>[] = [];
			for (let index = 0, length = settings.length; index < length; ++index) {
				const setting = settings[index];
				if (System.IsWatching() && !(setting.watch ?? true)) continue;
				execList.push(runner(setting, false, index + 1, length));
			}

			Promise.all(execList)
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
				.finally(() => {
					execList.splice(0, execList.length);
					logger.TimeEnd(timer, 'All done in', ELogColour.Green);
					return resolve();
				});
		});
	};

	return {
		Run
	};
};

export default CommandRunner();