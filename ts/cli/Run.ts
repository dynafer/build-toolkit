import { Toolkit } from '../BuildToolkit';
import { TRunner } from '../BuildToolkitCLI';
import { Config } from '../Configuration';

export const Run = (runner: TRunner) => {
	const toolkit = Toolkit({
		mode: 'production'
	});

	void runner(toolkit.Runner, Config);
};