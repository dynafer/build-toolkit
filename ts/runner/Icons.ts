import fs from 'fs';
import path from 'path';
import { Config } from '../Configuration';
import ExitCode from '../utils/ExitCode';
import { LoggerConstructor, ELogColour } from '../utils/Logger';
import System from '../utils/System';
import * as Type from '../utils/Type';

export interface IIconsSetting {
	dir: string,
	output: string,
	type: 'json' | 'const' | 'argument' | 'module',
	naming?: string,
}

export interface IIconsRunner {
	Build: (setting: IIconsSetting) => Promise<void>,
}

const Icons = (): IIconsRunner => {
	const logger = LoggerConstructor('Icons');

	const save = (output: string, getText: () => string): Promise<void> =>
		new Promise((resolve, reject) => {
			fs.writeFile(output, getText(), 'utf8', (error) => {
				if (error) reject(error);

				return resolve();
			});
		});

	const mapToString = (map: Record<string, string>): string => {
		let text = '';
		for (const [key, value] of Object.entries(map)) {
			text += `\t'${key}': '${value.replace(/'/gi, '"')}',\n`;
		}
		return text;
	};

	const createGetText = (type: Exclude<IIconsSetting['type'], 'module'>, naming: string | undefined, map: Record<string, string>) =>
		(): string => {
			switch (type) {
				case 'json':
					return JSON.stringify(map);
				case 'const':
					return `const ${naming} = {\n${mapToString(map)}};`;
				case 'argument':
					return `${naming}({\n${mapToString(map)}});`;
			}
		};

	const createModuleStrings = (type: 'js' | 'declare', naming: string | undefined, getText: () => string) =>
		() => {
			switch (type) {
				case 'js':
					return `${getText()}\nexport default ${naming};`;
				case 'declare':
					return `declare const ${naming}: Record<string, string>;\nexport default ${naming}`;
			}
		};

	const Build = (setting: IIconsSetting): Promise<void> => {
		if (System.IsWatching() && System.IsError()) return Promise.resolve();
		if (!Type.IsObject(setting)) {
			logger.Throw('Setting must be an object');
			return Promise.resolve();
		}

		logger.Log('Building icons...');
		logger.Time('Done in', ELogColour.Green);

		return new Promise((resolve) => {
			const dir = path.resolve(Config.BasePath, setting.dir);
			const combinedDir = path.resolve(Config.BasePath, dir);
			if (!fs.existsSync(dir) && !fs.existsSync(combinedDir)) {
				logger.Throw(`${dir} doesn't exist.`);
				return resolve();
			}

			const output = setting.output;

			const realPath = fs.existsSync(dir) ? dir : combinedDir;
			const svgs = fs.readdirSync(realPath);

			const svgMap: Record<string, string> = {};
			for (const svg of svgs) {
				if (!svg.includes('.svg')) continue;
				svgMap[svg.replace('.svg', '')] = fs.readFileSync(path.resolve(realPath, svg), 'utf8');
			}

			switch (setting.type) {
				case 'json':
				case 'const':
				case 'argument':
					return save(output, createGetText(setting.type, setting.naming, svgMap))
						.then(() => {
							logger.TimeEnd('Done in', ELogColour.Green);
							return resolve();
						})
						.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED));
				case 'module':
					const getText = createGetText('const', setting.naming, svgMap);
					const saves = [
						save(`${output}.js`, createModuleStrings('js', setting.naming, getText)),
						save(`${output}.d.ts`, createModuleStrings('declare', setting.naming, getText)),
					];
					return Promise.all(saves)
						.catch(error => logger.Throw(error, ExitCode.FAILURE.UNEXPECTED))
						.finally(() => {
							logger.TimeEnd('Done in', ELogColour.Green);
							return resolve();
						});
				default:
					logger.Throw(`${setting.type} type doesn't exist.`);
					return resolve();
			}
		});
	};

	return {
		Build,
	};
};

export default Icons();