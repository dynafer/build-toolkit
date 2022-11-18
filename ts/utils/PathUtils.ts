export interface IPathUtils {
	WorkDir: string,
}

const PathUtils = (): IPathUtils => {
	const WorkDir = process.cwd() ?? '';

	return {
		WorkDir
	};
};

export default PathUtils();