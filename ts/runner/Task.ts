import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import System from '../utils/System';
import * as Utils from '../utils/Utils';

export interface ITask {
	(): Promise<void>;
}

export interface ITaskRunner {
	Run: (task: ITask, watch?: boolean) => Promise<void>,
}

const TaskRunner = (): ITaskRunner => {
	const logger = LoggerConstructor('Task');

	const Run = (task: ITask, watch: boolean = true): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (System.IsWatching() && !watch) return Promise.resolve();
		logger.Log('Running a task...');
		const timer = logger.Time();

		return new Promise(resolve => {
			if (!Utils.IsFunction(task)) {
				logger.Throw('Must be an asynchronous function.');
				return resolve();
			}

			return task()
				.then(() => {
					logger.TimeEnd(timer, 'Done in', ELogColour.Green);
					return resolve();
				})
				.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
		});
	};

	return {
		Run
	};
};

export default TaskRunner();