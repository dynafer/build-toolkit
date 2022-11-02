import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
import System from '../utils/System';
import * as Type from '../utils/Type';

export interface ITask {
	(): Promise<void>
}

export interface ITaskRunner {
	readonly Run: (task: ITask, watch?: boolean) => void;
}

const TaskRunner = (): ITaskRunner => {
	const logger = LoggerConstructor('Task');

	const Run = (task: ITask, watch: boolean = true): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (System.IsWatching() && !watch) return Promise.resolve();
		logger.Log('Running a task...');
		logger.Time('Done in', ELogColour.Green);

		return new Promise((resolve) => {
			if (!Type.IsFunction(task)) {
				logger.Throw('Must be an asynchronous function.');
				return resolve();
			}

			task()
				.then(() => {
					logger.TimeEnd('Done in', ELogColour.Green);
					resolve();
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	return {
		Run
	};
};

export default TaskRunner();