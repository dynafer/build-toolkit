import TestLogger from './Logger.test';
import TestPathUtils from './PathUtils.test';
import TestSystem from './System.test';
import TestUtils from './Utils.test';

const TestAllUtils = () =>
	describe('@dynafer/build-toolkit/utils', () => {
		TestLogger();
		TestPathUtils();
		TestSystem();
		TestUtils();
	});

export default TestAllUtils;