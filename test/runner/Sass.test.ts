import fs from 'fs';
import path from 'path';
import { Configure } from '../../ts/Configuration';
import SassRunner, { ISassSetting } from '../../ts/runner/Sass';
import System from '../../ts/utils/System';

const TestSass = () =>
	describe('@dynafer/build-toolkit/runner/Sass', () => {
		Configure();

		const TEST_DIRECTORY = './test/sass';

		const createSassFile = (file: string) => {
			const chunks: string[] = [];
			chunks.push('.test {\n');
			chunks.push('\tbackground-color: red;\n');
			chunks.push('}');

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

		it('should compile a single SASS file', async () => {
			const input = path.join(TEST_DIRECTORY, 'test1.scss');
			const output = path.join(TEST_DIRECTORY, 'test1.css');
			const setting: ISassSetting = { input, output };

			createSassFile(input);

			await SassRunner.Run(setting);

			const css = fs.readFileSync(output, 'utf8');
			expect(css).toContain('background-color: red;');
			fs.unlinkSync(output);
		});

		it('should compile multiple SASS files', async () => {
			const input1 = path.join(TEST_DIRECTORY, 'test1.scss');
			const output1 = path.join(TEST_DIRECTORY, 'test1.css');
			const input2 = path.join(TEST_DIRECTORY, 'test2.scss');
			const output2 = path.join(TEST_DIRECTORY, 'test2.css');
			const settings: ISassSetting[] = [
				{ input: input1, output: output1 },
				{ input: input2, output: output2 },
			];

			createSassFile(input1);
			createSassFile(input2);

			await SassRunner.Run(settings);

			const css1 = fs.readFileSync(output1, 'utf8');
			expect(css1).toContain('background-color: red;');

			const css2 = fs.readFileSync(output2, 'utf8');
			expect(css2).toContain('background-color: red;');
		});

		it('should handle errors gracefully', async () => {
			const input = path.join(TEST_DIRECTORY, 'test3.scss');
			const output = path.join(TEST_DIRECTORY, 'test3.css');
			const setting: ISassSetting = { input, output };

			System.SetWatching(true);
			await SassRunner.Run(setting);
			System.SetWatching(false);

			expect(fs.existsSync(output)).toBe(false);
		});
	});

export default TestSass;