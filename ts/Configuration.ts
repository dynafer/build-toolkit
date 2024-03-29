import PathUtils from './utils/PathUtils';
import * as Utils from './utils/Utils';

let Config: IToolkitConfiguration;

export interface IToolkitOption {
	basePath?: string,
	watchDir?: string,
	mode?: string,
}

export interface IToolkitConfiguration {
	BasePath: string,
	WatchDir: string,
	Mode: string,
}

const Configure = (config: IToolkitOption = {}): void => {
	if (!config.basePath || Utils.IsEmpty(config.basePath)) config.basePath = PathUtils.WorkDir;
	if (!config.watchDir || Utils.IsEmpty(config.watchDir)) config.watchDir = '';
	if (!config.mode || Utils.IsEmpty(config.mode)) config.mode = 'development';

	const BasePath = config.basePath;
	const WatchDir = config.watchDir;
	const Mode = config.mode;

	Config = {
		BasePath,
		WatchDir,
		Mode
	};
};

export {
	Config,
	Configure
};