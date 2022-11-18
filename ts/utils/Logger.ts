import ExitCode from './ExitCode';
import System from './System';
import * as Type from './Type';

export enum ELogColour {
	Default = '%s',
	Black = '\x1b[30m%s\x1b[0m',
	Red = '\x1b[31m%s\x1b[0m',
	Green = '\x1b[32m%s\x1b[0m',
	Yellow = '\x1b[33m%s\x1b[0m',
	Blue = '\x1b[34m%s\x1b[0m',
	Magenta = '\x1b[35m%s\x1b[0m',
	Cyan = '\x1b[36m%s\x1b[0m',
	White = '\x1b[37m%s\x1b[0m',
}

export interface ILoggerConstructor {
	UseLoggerManually: () => void,
	Clear: () => void,
	Color: (text?: string, color?: string) => string,
	Log: (text?: string, color?: string) => void,
	Throw: (error?: Error | string, code?: number) => void,
	Time: (label?: string, color?: string) => void,
	TimeEnd: (label?: string, color?: string) => void,
}

const LoggerConstructor = (name: string = 'Build-Toolkit'): ILoggerConstructor => {
	let bLogger: boolean = System.IsLogging();

	const UseLoggerManually = () => {
		bLogger = true;
	};

	const Clear = () => console.clear();

	const Color = (text: string = '', color: string = ELogColour.Default): string => color.replace('%s', `${name}: ${text}`);

	const Log = (text: string = '', color: string = ELogColour.Default) => {
		if (!bLogger) return;
		console.log(Color(text, color));
	};

	const Throw = (error: Error | string = '', code: number = ExitCode.FAILURE.ERROR) => {
		if (Type.IsError(error)) {
			console.error(error);
		} else if (Type.IsString(error) && !Type.IsEmpty(error)) {
			console.error(ELogColour.Red, new Error(`${name}: ${error}`));
		}

		System.SetError(true);

		if (!bLogger) return;
		process.exit(code);
	};

	const Time = (label: string = '', color: string = ELogColour.Default) => {
		if (!bLogger) return;
		console.time(Color(label, color));
	};

	const TimeEnd = (label: string = '', color: string = ELogColour.Default) => {
		if (!bLogger) return;
		console.timeEnd(Color(label, color));
	};

	return {
		UseLoggerManually,
		Clear,
		Color,
		Log,
		Throw,
		Time,
		TimeEnd,
	};
};

export {
	LoggerConstructor
};