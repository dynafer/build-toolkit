import TestAllRunners from './runner/Index.test';
import TestAllUtils from './utils/Index.test';

describe('@dynafer/build-toolkit', () => {
	TestAllUtils();
	TestAllRunners();
});