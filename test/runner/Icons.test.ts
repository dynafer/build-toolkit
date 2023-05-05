import fs from 'fs';
import path from 'path';
import { Configure } from '../../ts/Configuration';
import IconsRunner, { TIconSetting } from '../../ts/runner/Icons';

const TestIcons = () =>
	describe('@dynafer/build-toolkit/runner/Icons', () => {
		Configure();
		const TEST_DIRECTORY = './test/icons';

		const createSvgFiles = () => {
			const svg = '<svg>...</svg>';
			for (let index = 1; index < 4; ++index) {
				fs.writeFileSync(path.join(TEST_DIRECTORY, `./icon${index}.svg`), svg, 'utf-8');
			}
		};

		const clearDirectory = (dir: string) => {
			const files = fs.readdirSync(dir);
			for (const file of files) {
				fs.unlinkSync(path.join(dir, file));
			}
		};

		beforeEach(() => {
			if (!fs.existsSync(TEST_DIRECTORY)) fs.mkdirSync(TEST_DIRECTORY);
			createSvgFiles();
		});

		afterEach(() => {
			jest.resetAllMocks();
			clearDirectory(TEST_DIRECTORY);
			if (fs.existsSync(TEST_DIRECTORY)) fs.rmdirSync(TEST_DIRECTORY);
		});

		it('should build a JSON file of icons', async () => {
			const outputPath = path.join(__dirname, 'icons.json');

			const iconSettings: TIconSetting = {
				dir: TEST_DIRECTORY,
				output: outputPath,
				type: 'json',
			};

			jest.spyOn(fs, 'writeFile').mockImplementation(
				(...params: unknown[]) => {
					const file = params[0] as string;
					const data = params[1] as string;
					const callback = params[3] as fs.NoParamCallback;

					expect(file).toBe(outputPath);
					expect(data).toEqual(JSON.stringify({
						icon1: '<svg>...</svg>',
						icon2: '<svg>...</svg>',
						icon3: '<svg>...</svg>',
					}));
					if (fs.existsSync(outputPath)) fs.rmSync(outputPath);

					callback(null);
				}
			);

			await IconsRunner.Build(iconSettings);
		});

		it('should build a TypeScript module of icons', async () => {
			const outputDir = __dirname;
			const outputName = 'icons';
			const jsOutputPath = path.join(outputDir, `${outputName}.js`);
			const dtsOutputPath = path.join(outputDir, `${outputName}.d.ts`);

			const iconSettings: TIconSetting = {
				dir: TEST_DIRECTORY,
				output: path.join(outputDir, outputName),
				type: 'module',
				naming: 'myIcons',
			};

			jest.spyOn(fs, 'writeFile').mockImplementation(
				(...params: unknown[]) => {
					const file = params[0] as string;
					const data = params[1] as string;
					const callback = params[3] as fs.NoParamCallback;

					if (file === jsOutputPath) {
						expect(data).toContain('export default myIcons;');
						if (fs.existsSync(jsOutputPath)) fs.rmSync(jsOutputPath);
					} else if (file === dtsOutputPath) {
						expect(data).toContain('declare const myIcons: Record<string, string>;');
						expect(data).toContain('export default myIcons;');
						if (fs.existsSync(dtsOutputPath)) fs.rmSync(dtsOutputPath);
					} else {
						throw new Error(`Unexpected output path: ${file}`);
					}

					callback(null);
				}
			);

			await IconsRunner.Build(iconSettings);
		});
	});

export default TestIcons;