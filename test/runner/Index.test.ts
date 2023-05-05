import TestCommand from './Command.test';
import TestIcons from './Icons.test';
import TestRollup from './Rollup.test';
import TestSass from './Sass.test';
import TestTask from './Task.test';

const TestAllRunners = () =>
	describe('@dynafer/build-toolkit/runner', () => {
		TestCommand();
		TestIcons();
		TestRollup();
		TestSass();
		TestTask();
	});

export default TestAllRunners;