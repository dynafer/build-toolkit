export interface IClassConstructor<T> {
	new(): T;
	prototype: T;
}

const getType = (value: unknown = undefined): string => {
	const type: string = typeof value;
	switch (true) {
		case value === null:
			return 'null';
		case type === 'object' && Array.isArray(value):
			return 'array';
		default:
			return type;
	}
};

const isType = <T>(type: string) => (value: unknown): value is T => getType(value) === type;
const isInstanceOf = <T>(instance: IClassConstructor<T>) => (value: unknown): value is T => value instanceof instance;

export const IsArray: (value: unknown) => value is unknown[] = isType('array');
export const IsNumber: (value: unknown) => value is number = isType('number');
export const IsObject: (value: unknown) => value is object = isType('object');
export const IsString: (value: unknown) => value is string = isType('string');
export const IsBoolean: (value: unknown) => value is boolean = isType('boolean');
export const IsFunction: (value: unknown) => value is () => void = isType('function');
export const IsError: (value: unknown) => value is Error = isInstanceOf(Error);

export const IsEmpty: (value: unknown) => boolean = (value: unknown) => (IsString(value) || IsArray(value)) && value.length === 0;

export const Padding = (value: number | string, length: number = 2, pad: number | string = '0') =>
	value.toString().padStart(length, pad.toString());