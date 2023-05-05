import { Configure } from '../../ts/Configuration';
import Command, { ICommandSetting } from '../../ts/runner/Command';
import System from '../../ts/utils/System';

const TestCommand = () =>
	describe('@dynafer/build-toolkit/runner/Command', () => {
		Configure();

		afterEach(() => jest.resetAllMocks());

		it('should execute a single command', async () => {
			const command: ICommandSetting = {
				command: 'echo "Hello, world!"',
			};

			await Command.Run(command);
		});

		it('should execute multiple commands', async () => {
			const commands: ICommandSetting[] = [
				{
					command: 'echo "Hello!"',
				},
				{
					command: 'echo "World!"',
				},
			];
			await Command.Run(commands);
		});

		it('should execute commands in the correct order', async () => {
			const commands: ICommandSetting[] = [
				{
					command: 'echo "First!"',
				},
				{
					command: 'echo "Second!"',
				},
				{
					command: 'echo "Third!"',
				},
			];

			await Command.Run(commands);
		});

		it('should change the working directory before executing a command', async () => {
			const command: ICommandSetting = {
				cd: './ts',
				command: 'echo "Hello, src!"',
			};

			await Command.Run(command);
		});

		it('should throw an error when a command is not a string', async () => {
			const command: ICommandSetting = {
				command: (undefined as unknown) as string,
			};

			const spyLogger = jest.spyOn(console, 'error').mockImplementation();

			System.SetWatching(true);
			await Command.Run(command);
			System.SetWatching(false);

			expect(spyLogger).toHaveBeenCalledWith(expect.stringContaining('Command must be a string'));
		});
	});

export default TestCommand;