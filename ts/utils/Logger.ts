import crypto from 'crypto';
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
	Grey = '\x1b[90m%s\x1b[0m',
	White = '\x1b[37m%s\x1b[0m',
}

export interface ILoggerConstructor {
	Clear: () => void,
	Color: (text?: string, color?: string, current?: number, total?: number) => string,
	Log: (text?: string, color?: string) => void,
	Throw: (error?: Error | string, code?: number) => void,
	Time: () => string,
	TimeEnd: (uuid: string, label?: string, color?: string, current?: number, total?: number) => void,
}

const LoggerConstructor = (name: string = 'Build-Toolkit', bUseManually: boolean = false): ILoggerConstructor => {
	const timers: Record<string, number> = {};

	const isLogging = (): boolean => bUseManually || System.IsLogging();

	const Clear = () => {
		const lines = process.stdout.getWindowSize()[1];
		for (let i = 0; i < lines; i++) {
			console.log('\r\n');
		}
		console.clear();
	};

	const Color = (text: string = '', color: string = ELogColour.Default, current?: number, total?: number): string => {
		const steps = current && total ? `[${current}/${total}] ` : '';

		const currentTime = new Date();
		const timeString = [
			Type.Padding(currentTime.getHours()),
			Type.Padding(currentTime.getMinutes()),
			Type.Padding(currentTime.getSeconds())
		].join(':');

		const replacedText = color.replace('%s', `${steps}${name}: ${text}`);

		return `[${ELogColour.Grey.replace('%s', timeString)}] ${replacedText}`;
	};

	const Log = (text: string = '', color: string = ELogColour.Default) => {
		if (!isLogging()) return;
		console.log(Color(text, color));
	};

	const Throw = (error: Error | string = '', code: number = ExitCode.FAILURE.ERROR) => {
		if (Type.IsError(error)) {
			console.error(error);
		} else if (Type.IsString(error) && !Type.IsEmpty(error)) {
			console.error(ELogColour.Red, new Error(`${name}: ${error}`));
		}

		System.SetError(true);

		if (System.IsWatching()) return;
		process.exit(code);
	};

	const Time = (): string => {
		if (!isLogging()) return '';
		const uuid = crypto.randomUUID();
		timers[uuid] = new Date().getTime();
		return uuid;
	};

	const TimeEnd = (uuid: string, label: string = '', color: string = ELogColour.Default, current?: number, total?: number) => {
		if (!isLogging() || Type.IsEmpty(uuid) || !timers[uuid]) return;
		const currentTime = new Date().getTime();
		const milliseconds = new Date(currentTime - timers[uuid]).getTime();
		delete timers?.[uuid];

		const seconds = milliseconds / 1000;

		const bShowMS = seconds < 1;
		const interval = bShowMS ? milliseconds : seconds;
		const intervalUnit = bShowMS ? 'ms' : 's';

		console.log(Color(`${label} ${interval}${intervalUnit}`, color, current, total));
	};

	return {
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