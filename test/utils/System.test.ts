import System from '../../ts/utils/System';

const TestSystem = () =>
	describe('@dynafer/build-toolkit/utils/System', () => {
		beforeEach(() => {
			jest.resetAllMocks();
		});

		it('should set the error flag correctly', () => {
			System.SetError(true);
			expect(process.env.IsError).toEqual('true');
			System.SetError(false);
			expect(process.env.IsError).toEqual('false');
		});

		it('should set the logging flag correctly', () => {
			System.SetLogging(true);
			expect(process.env.IsLogging).toEqual('true');
			System.SetLogging(false);
			expect(process.env.IsLogging).toEqual('false');
		});

		it('should set the watching flag correctly', () => {
			System.SetWatching(true);
			expect(process.env.IsWatching).toEqual('true');
			System.SetWatching(false);
			expect(process.env.IsWatching).toEqual('false');
		});

		it('should get the error flag correctly', () => {
			process.env.IsError = 'true';
			expect(System.IsError()).toEqual(true);
			process.env.IsError = 'false';
			expect(System.IsError()).toEqual(false);
		});

		it('should get the logging flag correctly', () => {
			process.env.IsLogging = 'true';
			expect(System.IsLogging()).toEqual(true);
			process.env.IsLogging = 'false';
			expect(System.IsLogging()).toEqual(false);
		});

		it('should get the watching flag correctly', () => {
			process.env.IsWatching = 'true';
			expect(System.IsWatching()).toEqual(true);
			process.env.IsWatching = 'false';
			expect(System.IsWatching()).toEqual(false);
		});
	});

export default TestSystem;