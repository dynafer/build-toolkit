import { ELogColour, LoggerConstructor } from '../../ts/utils/Logger';
import System from '../../ts/utils/System';

const TestLogger = () =>
	describe('@dynafer/build-toolkit/utils/Logger', () => {
		const logger = LoggerConstructor('Test');

		beforeAll(() => {
			System.SetLogging(true);
		});

		afterEach(() => jest.resetAllMocks());

		it('should format log messages correctly', () => {
			const spyLogger = jest.spyOn(console, 'log').mockImplementation();

			logger.Log('Hello world', ELogColour.Green);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Test: Hello world'));
			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('\x1b[32m'));
		});

		it('should measure elapsed time correctly', () => {
			const timmer = logger.Time();

			jest.useFakeTimers();
			jest.spyOn(global, 'setTimeout');

			setTimeout(() => {
				logger.TimeEnd(timmer, 'Elapsed time', ELogColour.Blue);
			}, 50);

			expect(setTimeout).toHaveBeenCalledTimes(1);
			expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 50);
		});

		it('should throw errors correctly', () => {
			const spyLogger = jest.spyOn(console, 'error').mockImplementation();

			System.SetWatching(true);
			logger.Throw('Something went wrong');
			System.SetWatching(false);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Test: Something went wrong'));
			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('\x1b[31m'));
		});
	});

export default TestLogger;