import fs from 'fs';
import path from 'path';
import { minify } from 'uglify-js';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { ELogColour, LoggerConstructor } from '../utils/Logger';
import PathUtils from '../utils/PathUtils';
import System from '../utils/System';
import * as Type from '../utils/Type';

export type TIconSetting = IJsonSetting | IOtherSettings;

interface IIconSetting {
	dir: string,
	output: string,
	uglified?: boolean,
}

interface IJsonSetting extends IIconSetting {
	type: 'json',
	naming?: string,
}

interface IOtherSettings extends IIconSetting {
	type: 'const' | 'argument' | 'module',
	naming: string,
}

export interface IIconsRunner {
	Build: (setting: TIconSetting) => Promise<void>,
}

const Icons = (): IIconsRunner => {
	const logger = LoggerConstructor('Icons');

	const save = (output: string, bUglify: boolean, getText: () => string): Promise<void> =>
		new Promise(resolve =>
			fs.writeFile(output, bUglify ? minify(getText()).code : getText(), 'utf8', error => {
				if (error) return logger.Throw(error);
				return resolve();
			})
		);

	const combineStringSafely = (chunks: string[]): string => {
		const text = chunks.join('');
		chunks.splice(0, chunks.length);
		return text;
	};

	const mapToString = (map: Record<string, string>): string => {
		const chunks: string[] = [];
		Object.entries(map).forEach(([key, value]) => {
			chunks.push('\t', key, ': \'', value.replace(/'/gi, '\''), '\',', '\n');
		});
		return combineStringSafely(chunks);
	};

	const createGetText = (opts: TIconSetting, map: Record<string, string>) =>
		(): string => {
			const { type, naming } = opts;
			const chunks: string[] = [];

			switch (type) {
				case 'json':
					return JSON.stringify(map);
				case 'const':
				case 'module':
					chunks.push('const ', naming, ' = ', '{\n', mapToString(map), '};');
					return combineStringSafely(chunks);
				case 'argument':
					chunks.push(naming, '({\n', mapToString(map), '});');
					return combineStringSafely(chunks);
			}
		};

	const createModuleStrings = (type: 'js' | 'declare', naming: IOtherSettings['naming'], getText: () => string) =>
		() => {
			const chunks: string[] = [];

			switch (type) {
				case 'js':
					chunks.push(getText(), '\nexport default ', naming, ';');
					return combineStringSafely(chunks);
				case 'declare':
					chunks.push('declare const ', naming, ': Record<string, string>;\nexport default ', naming, ';');
					return combineStringSafely(chunks);
			}
		};

	const Build = (setting: TIconSetting): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (!Type.IsObject(setting)) {
			logger.Throw('Setting must be an object.');
			return Promise.resolve();
		}

		if (['const', 'argument', 'module'].includes(setting.type) && (!Type.IsString(setting.naming) || !Type.IsEmpty(setting.naming))) {
			logger.Throw(`${setting.type} requires naming.`);
			return Promise.resolve();
		}

		logger.Log('Building icons...');
		const timer = logger.Time();

		return new Promise(resolve => {
			const dir = PathUtils.GetAbsolute(setting.dir, Config.BasePath);
			if (!fs.existsSync(dir)) {
				logger.Throw(`${dir} doesn't exist.`);
				return resolve();
			}

			const output = PathUtils.GetAbsolute(setting.output, Config.BasePath);

			const bUglify = setting.uglified ?? false;

			const svgs = fs.readdirSync(dir);

			const svgMap: Record<string, string> = {};
			svgs.forEach(svg => {
				if (!svg.includes('.svg')) return;
				svgMap[svg.replace('.svg', '')] = fs.readFileSync(path.resolve(dir, svg), 'utf8');
			});

			switch (setting.type) {
				case 'json':
				case 'const':
				case 'argument':
					return save(output, bUglify, createGetText(setting, svgMap))
						.then(() => {
							logger.TimeEnd(timer, 'Done in', ELogColour.Green);
							return resolve();
						})
						.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
				case 'module':
					const getText = createGetText(setting, svgMap);
					const saves = [
						save(`${output}.js`, bUglify, createModuleStrings('js', setting.naming, getText)),
						save(`${output}.d.ts`, bUglify, createModuleStrings('declare', setting.naming, getText)),
					];
					return Promise.all(saves)
						.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
						.finally(() => {
							logger.TimeEnd(timer, 'Done in', ELogColour.Green);
							return resolve();
						});
				default:
					logger.Throw(`${(setting as Record<string, string>).type} type doesn't exist.`);
					return resolve();
			}
		});
	};

	return {
		Build,
	};
};

export default Icons();