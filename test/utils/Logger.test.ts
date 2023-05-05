import { ELogColour, LoggerConstructor } from '../../ts/utils/Logger';
import System from '../../ts/utils/System';

const TestLogger = () =>
	describe('@dynafer/build-toolkit/utils/Logger', () => {
		beforeAll(() => {
			System.SetLogging(true);
		});

		it('should format log messages correctly', () => {
			const logger = LoggerConstructor('Test');

			const output = jest.spyOn(console, 'log').mockImplementation();

			logger.Log('Hello world', ELogColour.Green);

			expect(output).toHaveBeenCalledWith(expect.stringContaining('Test: Hello world'));
			expect(output).toHaveBeenCalledWith(expect.stringContaining('\x1b[32m'));
		});

		it('should measure elapsed time correctly', () => {
			const logger = LoggerConstructor('Test');

			const output = jest.spyOn(console, 'log').mockImplementation();

			const timmer = logger.Time();

			setTimeout(() => {
				logger.TimeEnd(timmer, 'Elapsed time', ELogColour.Blue);

				expect(output).toHaveBeenCalledWith(expect.stringContaining('Elapsed time 500ms'));
				expect(output).toHaveBeenCalledWith(expect.stringContaining('\x1b[34m'));
			}, 500);
		});

		it('should throw errors correctly', () => {
			const logger = LoggerConstructor('Test');

			const output = jest.spyOn(console, 'error').mockImplementation();

			System.SetWatching(true);
			logger.Throw('Something went wrong');
			System.SetWatching(false);

			expect(output).toHaveBeenCalledWith(expect.stringContaining('Test: Something went wrong'));
			expect(output).toHaveBeenCalledWith(expect.stringContaining('\x1b[31m'));
		});
	});

export default TestLogger;