const System = () => {
	const SetError = (bError: boolean) => {
		process.env.IsError = bError ? 'true' : 'false';
	};
	const SetLogging = (bLogging: boolean) => {
		process.env.IsLogging = bLogging ? 'true' : 'false';
	};
	const SetWatching = (bWatching: boolean) => {
		process.env.IsWatching = bWatching ? 'true' : 'false';
	};

	const IsError = (): boolean => process.env.IsError === 'true';
	const IsLogging = (): boolean => process.env.IsLogging === 'true';
	const IsWatching = (): boolean => process.env.IsWatching === 'true';

	return {
		SetError,
		SetLogging,
		SetWatching,
		IsError,
		IsLogging,
		IsWatching,
	};
};

export default System();