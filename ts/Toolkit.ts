import { Configure, IToolkitOption } from './Configuration';
import CommandRunner, { ICommandRunner } from './runner/Command';
import IconsRunner, { IIconsRunner } from './runner/Icons';
import RollupRunner, { IRollupRunner } from './runner/Rollup';
import SassRunner, { ISassRunner } from './runner/Sass';
import TaskRunner, { ITaskRunner } from './runner/Task';
import TestRunner, { ITestRunner } from './runner/Test';

export type TToolkit = (config: IToolkitOption) => IToolkit;

export interface IToolkitRunner {
	readonly Command: ICommandRunner,
	readonly Icons: IIconsRunner,
	readonly Rollup: IRollupRunner,
	readonly Sass: ISassRunner,
	readonly Task: ITaskRunner,
	readonly Test: ITestRunner,
}

export interface IToolkit {
	readonly Runner: IToolkitRunner,
}

const Toolkit = (config: IToolkitOption): IToolkit => {
	Configure(config);

	return {
		Runner: {
			Command: CommandRunner,
			Icons: IconsRunner,
			Rollup: RollupRunner,
			Sass: SassRunner,
			Task: TaskRunner,
			Test: TestRunner,
		}
	};
};

export default Toolkit;