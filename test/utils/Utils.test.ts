import * as Utils from '../../ts/utils/Utils';

const TestUtils = () =>
	describe('@dynafer/build-toolkit/utils/Utils', () => {
		describe('IsArray', () => {
			it('should return true if value is an array', () => {
				expect(Utils.IsArray([])).toBe(true);
			});
			it('should return false if value is not an array', () => {
				expect(Utils.IsArray('not an array')).toBe(false);
			});
		});

		describe('IsNumber', () => {
			it('should return true if value is a number', () => {
				expect(Utils.IsNumber(42)).toBe(true);
			});
			it('should return false if value is not a number', () => {
				expect(Utils.IsNumber('not a number')).toBe(false);
			});
		});

		describe('IsObject', () => {
			it('should return true if value is an object', () => {
				expect(Utils.IsObject({})).toBe(true);
			});
			it('should return false if value is not an object', () => {
				expect(Utils.IsObject('not an object')).toBe(false);
			});
		});

		describe('IsString', () => {
			it('should return true if value is a string', () => {
				expect(Utils.IsString('a string')).toBe(true);
			});
			it('should return false if value is not a string', () => {
				expect(Utils.IsString(42)).toBe(false);
			});
		});

		describe('IsBoolean', () => {
			it('should return true if value is a boolean', () => {
				expect(Utils.IsBoolean(true)).toBe(true);
			});
			it('should return false if value is not a boolean', () => {
				expect(Utils.IsBoolean(42)).toBe(false);
			});
		});

		describe('IsFunction', () => {
			it('should return true if value is a function', () => {
				expect(Utils.IsFunction(() => { })).toBe(true);
			});
			it('should return false if value is not a function', () => {
				expect(Utils.IsFunction(42)).toBe(false);
			});
		});

		describe('IsError', () => {
			it('should return true if value is an Error', () => {
				expect(Utils.IsError(new Error('test'))).toBe(true);
			});
			it('should return false if value is not an Error', () => {
				expect(Utils.IsError('not an Error')).toBe(false);
			});
		});

		describe('IsEmpty', () => {
			it('should return true if value is an empty string', () => {
				expect(Utils.IsEmpty('')).toBe(true);
			});
			it('should return true if value is an empty array', () => {
				expect(Utils.IsEmpty([])).toBe(true);
			});
			it('should return false if value is not empty', () => {
				expect(Utils.IsEmpty('not empty')).toBe(false);
				expect(Utils.IsEmpty([1, 2, 3])).toBe(false);
			});
		});

		describe('Padding', () => {
			it('should add padding to a number', () => {
				expect(Utils.Padding(1)).toBe('01');
				expect(Utils.Padding(42, 4)).toBe('0042');
				expect(Utils.Padding(42, 4, '-')).toBe('--42');
			});
			it('should add padding to a string', () => {
				expect(Utils.Padding('1')).toBe('01');
				expect(Utils.Padding('42', 4)).toBe('0042');
				expect(Utils.Padding('42', 4, '-')).toBe('--42');
			});
		});
	});

export default TestUtils;