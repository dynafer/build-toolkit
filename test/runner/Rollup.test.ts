import fs from 'fs';
import path from 'path';
import { Configure } from '../../ts/Configuration';
import RollupRunner, { IRollupOptions } from '../../ts/runner/Rollup';
import System from '../../ts/utils/System';

const TestRollup = () =>
	describe('@dynafer/build-toolkit/runner/Rollup', () => {
		Configure();
		const TEST_DIRECTORY = './test/icons';

		const createJsFile = (file: string) => {
			const chunks: string[] = [];
			chunks.push('console.log(\'Hello World\')');

			fs.writeFileSync(file, chunks.join(''), 'utf-8');
		};

		const clearDirectory = (dir: string) => {
			const files = fs.readdirSync(dir);
			for (const file of files) {
				fs.unlinkSync(path.join(dir, file));
			}
		};

		beforeEach(() => {
			if (!fs.existsSync(TEST_DIRECTORY)) fs.mkdirSync(TEST_DIRECTORY);
		});

		afterEach(() => {
			jest.resetAllMocks();
			clearDirectory(TEST_DIRECTORY);
			if (fs.existsSync(TEST_DIRECTORY)) fs.rmdirSync(TEST_DIRECTORY);
		});

		const setting = {
			input: path.join(TEST_DIRECTORY, './index.js'),
			output: {
				file: path.join(TEST_DIRECTORY, './bundle.js'),
				format: 'cjs',
				createUglified: true,
			},
		};

		it('should resolve if there are no registered rollup settings', async () => {
			const spyLogger = jest.spyOn(console, 'error').mockImplementation();

			System.SetError(false);
			System.SetWatching(true);
			await RollupRunner.Run();
			System.SetWatching(false);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('To run rollup, must register rollup before running.'));
		});

		it('should log a message and resolve if there are registered rollup settings', async () => {
			createJsFile(setting.input);
			RollupRunner.Register(setting as IRollupOptions);
			await RollupRunner.Run();

			expect(fs.existsSync(setting.output.file)).toBe(true);
		});
	});

export default TestRollup;