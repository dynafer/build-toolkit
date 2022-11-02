import { Configure, IToolkitOption } from './Configuration';
import CommandRunner, { ICommandRunner } from './runner/Command';
import RollupRunner, { IRollupRunner } from './runner/Rollup';
import SassRunner, { ISassRunner } from './runner/Sass';
import TaskRunner, { ITaskRunner } from './runner/Task';

export type TToolkit = (_config: IToolkitOption) => IToolkit;

export interface IToolkitRunner {
	Command: ICommandRunner,
	Rollup: IRollupRunner,
	Sass: ISassRunner,
	Task: ITaskRunner,
}

export interface IToolkit {
	Runner: IToolkitRunner
}

const Toolkit = (_config: IToolkitOption): IToolkit => {
	Configure(_config);

	const Rollup: IRollupRunner = RollupRunner;
	const Command: ICommandRunner = CommandRunner;
	const Sass: ISassRunner = SassRunner;
	const Task: ITaskRunner = TaskRunner;

	return {
		Runner: {
			Command,
			Rollup,
			Sass,
			Task,
		}
	};
};

export default Toolkit;