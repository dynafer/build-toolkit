import { Configure } from '../../ts/Configuration';
import TaskRunner, { ITask } from '../../ts/runner/Task';
import System from '../../ts/utils/System';

const TestTask = () =>
	describe('@dynafer/build-toolkit/runner/Task', () => {
		Configure();

		beforeEach(() => {
			System.SetError(false);
			System.SetLogging(true);
			System.SetWatching(false);
		});
		afterEach(() => jest.resetAllMocks());

		it('runs a task', async () => {
			const task = async () => {
				// Perform some task
			};

			const spyLogger = jest.spyOn(console, 'log').mockImplementation();

			await TaskRunner.Run(task);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Running a task...'));
			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Done in'));
		});

		it('does not run a task if in watch mode but watch flag is false', async () => {
			const task = async () => {
				// Perform some task
			};

			const spyLogger = jest.spyOn(console, 'log');

			System.SetWatching(true);
			await TaskRunner.Run(task, false);
			System.SetWatching(false);

			expect(spyLogger).not.toHaveBeenCalled();
		});

		it('throws an error if task is not a function', async () => {
			const task = 'not a function';

			const spyLogger = jest.spyOn(console, 'error').mockImplementation();

			System.SetWatching(true);
			await TaskRunner.Run((task as unknown) as ITask);
			System.SetWatching(false);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Must be an asynchronous function.'));
		});
	});

export default TestTask;