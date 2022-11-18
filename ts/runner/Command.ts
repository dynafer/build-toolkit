import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
import System from '../utils/System';
import { IsString, IsArray, IsObject } from '../utils/Type';

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

	const runner = (setting: ICommandSetting): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!IsString(setting.command)) {
			logger.Throw('Command must be a string.');
			return Promise.resolve();
		}
		logger.Log(`Executing ${setting.command}`);
		logger.Time('Done in', ELogColour.Green);

		return new Promise((resolve) => {
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
				logger.TimeEnd('Done in', ELogColour.Green);
				resolve();
			});
		});
	};

	const Run = (settings: ICommandSetting | ICommandSetting[]): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();

		if (!IsArray(settings) && !IsObject(settings)) {
			logger.Throw('Check your rollup configuration');
			return Promise.resolve();
		}

		if (IsArray(settings)) {
			logger.Log('Executing commands...');
			logger.Time('All done in', ELogColour.Green);
		} else {
			if (System.IsWatching() && !(settings.watch ?? true)) return Promise.resolve();
		}

		return new Promise((resolve) => {
			if (IsArray(settings)) {
				const execList: Promise<void>[] = [];
				for (const setting of settings) {
					if (System.IsWatching() && !(setting.watch ?? true)) continue;
					execList.push(runner(setting));
				}

				Promise.all(execList)
					.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
					.finally(() => {
						execList.splice(0, execList.length);
						logger.TimeEnd('All done in', ELogColour.Green);
						resolve();
					});
			} else {
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

export default CommandRunner();