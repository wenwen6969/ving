interface Fn<T = any, R = T> {
  (...arg: T[]): R
}
type Nullable<T> = T | null
type Recordable<T = any> = Record<string, T>
type ReadonlyRecordable<T = any> = Readonly<Record<string, T>>
type Indexable<T = any> = Record<string, T>
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
type TimeoutHandle = ReturnType<typeof setTimeout>
type IntervalHandle = ReturnType<typeof setInterval>

interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>
}

interface initBody {
  [key: string]: any
}

declare const wx: any
