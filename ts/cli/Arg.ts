const ARGS: Record<string, Record<string, string>> = {
	'-c': {
		type: 'config',
		help: '<filename>',
		description: 'Use this config file manually'
	},
	'--config': {
		type: 'config',
		help: '<filename>',
		description: 'Use this config file manually'
	},
	'-w': {
		type: 'watch',
		help: '<directory>',
		description: 'Directory to watch changes'
	},
	'--watch': {
		type: 'watch',
		help: '<directory>',
		description: 'Directory to watch changes'
	}
};

const HelpCLI = () => {
	const options: string[] = [];
	const types: string[] = [];
	const helps: string[] = [];
	const descriptions: string[] = [];

	for (const [option, value] of Object.entries(ARGS)) {
		if (types.includes(value.type)) {
			const index = types.indexOf(value.type);
			options[index] = `${options[index]}, ${option}`;
			continue;
		}

		options.push(option);
		types.push(value.type);
		helps.push(value.help);
		descriptions.push(value.description);
	}

	let terminalText = '';

	for (let index = 0; index < options.length; ++index) {
		terminalText += `${options[index]} ${helps[index]}\t\t${descriptions[index]}\n`;
	}

	console.log(terminalText);
};

const ArgConstructor = () => {
	const args: string[] = [];

	let bNeedPush = false;

	for (const arg of process.argv) {
		if (arg === '-h' || arg === '--help') {
			HelpCLI();
			process.exit();
		}

		if (!bNeedPush && arg.includes('build-toolkit.js')) {
			bNeedPush = true;
			continue;
		}

		if (bNeedPush) args.push(arg);
	}

	const GetOptions = (): Record<string, string> => {
		const options: Record<string, string> = {};
		const argKeys = Object.keys(ARGS);

		let bSkip = false;

		for (let index = 0, length = args.length; index < length; ++index) {
			if (bSkip) {
				bSkip = false;
				continue;
			}

			const arg = args[index];
			const nextArg = args[index + 1] ?? false;

			if (!argKeys.includes(arg) || !nextArg) continue;

			options[ARGS[arg].type] = nextArg;
		}

		return options;
	};

	return {
		GetOptions
	};
};

const Arg = ArgConstructor();

export default Arg;