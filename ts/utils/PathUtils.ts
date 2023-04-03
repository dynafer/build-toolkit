import path from 'path';

export interface IPathUtils {
	WorkDir: string,
	GetAbsolute: (targetPath: string, combinePath?: string) => string,
}

const PathUtils = (): IPathUtils => {
	const WorkDir = process.cwd() ?? '';

	const GetAbsolute = (targetPath: string, combinePath: string = WorkDir): string =>
		path.isAbsolute(targetPath) ? targetPath : path.resolve(combinePath, targetPath);

	return {
		WorkDir,
		GetAbsolute,
	};
};

export default PathUtils();