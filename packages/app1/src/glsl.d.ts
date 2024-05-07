declare module '*.glsl';

export class GUI<T = any> {
	add<K extends keyof BaseValueObject<T>>(params: T, name: K): AddItem<T[K]>;

	addFolder<K extends keyof ObjectValueObject<T>>(name: K): GUI<T[K]>;

	open(): void;
}

type BaseValue = number | string | boolean;
type BaseValueObject<T> = Pick<
	T,
	{
		[key in keyof T]: T[key] extends BaseValue ? key : never;
	}[keyof T]
>;
type ObjectValueObject<T> = Pick<
	T,
	{
		[key in keyof T]: T[key] extends BaseValue ? never : key;
	}[keyof T]
>;

type AddItem<T> = T extends number ? IAddNumberItem<T> : IAddItem<T>;

interface IAddNumberItem<T extends number> {
	onChange(callback: (v: T) => void): void;

	min(n: T): this;

	max(n: T): this;
}

interface IAddItem<T> {
	onChange(callback: (v: T) => void): void;
}
