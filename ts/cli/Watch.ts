import { Toolkit, Watcher } from '../BuildToolkit';
import { TRunner } from '../BuildToolkitCLI';

export const Watch = (runner: TRunner, watchDir: string) => {
	const toolkit = Toolkit({
		watchDir: watchDir
	});

	Watcher().Register(toolkit, runner);
};
