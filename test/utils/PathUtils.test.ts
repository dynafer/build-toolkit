import path from 'path';
import PathUtils from '../../ts/utils/PathUtils';

const TestPathUtils = () =>
	describe('@dynafer/build-toolkit/utils/PathUtils', () => {
		it('should get the current working directory correctly', () =>
			expect(PathUtils.WorkDir).toEqual(process.cwd())
		);

		it('should resolve absolute paths correctly', () => {
			const mockCwd = '/home/user/build-toolkit';
			const mockTargetPath = './src/index.ts';
			const mockResolvedPath = '/home/user/build-toolkit/src/index.ts';

			const absolutePath1 = PathUtils.GetAbsolute('/usr/local/bin');
			const absolutePath2 = PathUtils.GetAbsolute('/README.md');
			const absolutePath3 = PathUtils.GetAbsolute(mockTargetPath, mockCwd);

			expect(absolutePath1).toEqual('/usr/local/bin');
			expect(absolutePath2).toEqual('/README.md');
			expect(absolutePath3).toEqual(path.resolve(mockResolvedPath));
		});
	});

export default TestPathUtils;