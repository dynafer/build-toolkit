const path = require('path');
const cp = require('child_process');
const { promisify } = require('util');
const { watch } = require('chokidar');

const exec = promisify(cp.exec);

const bWatch = ['w', 'watch'].includes((process.argv[2] ?? '').replace(/-/g, '').toLowerCase());

const clear = () => {
	const lines = process.stdout.getWindowSize()[1];
	for (let i = 0; i < lines; i++) {
		console.log('\r\n');
	}
	console.clear();
};

const build = () =>
	Promise.all([
		exec('yarn run build:commonjs'),
		exec('yarn run build:module'),
		exec('yarn run build:types'),
	]);

const watching = () => {
	const COLOUR_MAP = {
		Red: '\x1b[31m%s\x1b[0m',
		Green: '\x1b[32m%s\x1b[0m',
		Cyan: '\x1b[36m%s\x1b[0m',
	};

	const MISSAVED_MILLISECONDS = 100;

	let lastChanged = new Date().getTime();
	let bWorking = false;

	const replaceColor = (text, color) => color.replace('%s', text);

	const logWatching = () => console.log(replaceColor('Watching files...', COLOUR_MAP.Cyan));
	const isChanged = time => Math.abs(lastChanged - time) > MISSAVED_MILLISECONDS;

	const update = async currentChanged => {
		clear();
		console.log('Detected changes and building...');
		console.time(replaceColor('Done in', COLOUR_MAP.Green));
		await build();
		console.timeEnd(replaceColor('Done in', COLOUR_MAP.Green));

		if (currentChanged >= lastChanged || !isChanged(currentChanged)) {
			bWorking = false;
			return logWatching();
		}

		await update(lastChanged)
			.catch(console.error);
	};

	const trigger = () => {
		const currentTime = new Date().getTime();
		if (lastChanged <= currentTime) lastChanged = currentTime;

		if (bWorking) return;

		bWorking = true;
		update(lastChanged)
			.catch(console.error);
	};

	watch(path.join(__dirname, './ts'), { ignored: /(build|lib|node_modules|logs)\//gi, ignoreInitial: true })
		.on('ready', () => logWatching())
		.on('add', trigger)
		.on('change', trigger)
		.on('unlink', trigger)
		.on('error', console.error);
};

const run = () => {
	clear();
	if (!bWatch)
		return build()
			.catch(console.error)
			.finally(process.exit);

	watching();
};

run();