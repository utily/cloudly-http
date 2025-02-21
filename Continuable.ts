export type Continuable<T> = T[] & { cursor?: string }

export namespace Continuable {
	export function is<T = any>(
		value: Continuable<T> | any,
		isItem?: (item: T | any) => item is T
	): value is Continuable<T> {
		return (
			Array.isArray(value) &&
			(!isItem || value.every(isItem)) &&
			(!("cursor" in value) || typeof value.cursor == "string")
		)
	}
	export function hasCursor<T = any>(
		value: Continuable<T> | any,
		isItem?: (item: T | any) => item is T
	): value is Required<Continuable<T>> {
		return is(value, isItem) && "cursor" in value
	}
	export function create<T>(continuable: Continuable<T> | T[], cursor?: string): Continuable<T> {
		return modify([...continuable], cursor)
	}
	export function modify<T>(continuable: Continuable<T> | T[], cursor?: string): Continuable<T> {
		const result: Continuable<T> = continuable
		if (!cursor && is(continuable))
			cursor = continuable.cursor
		if (cursor) {
			result.cursor = cursor
			const map = result.map
			result.map = <U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): Continuable<U> =>
				create(map.bind(result)(callbackfn, thisArg), cursor)
			const filter = result.filter
			result.filter = <S extends T>(
				predicate: (value: T, index: number, array: T[]) => value is S,
				thisArg?: any
			): Continuable<S> => create(filter.bind(result)(predicate, thisArg), cursor)
			const slice = result.slice
			result.slice = (start?: number, end?: number): Continuable<T> => create(slice.bind(result)(start, end), cursor)
			const splice = result.splice
			result.splice = (start: number, deleteCount?: number, ...items: T[]): Continuable<T> =>
				create(splice.bind(result)(start, deleteCount ?? Number.POSITIVE_INFINITY, ...items), cursor)
			const concat = result.concat
			result.concat = (...items: ConcatArray<T>[]): Continuable<T> => create(concat.bind(result)(...items), cursor)
		}
		return result
	}

	export async function awaits<T>(continuable: Continuable<Promise<T>>): Promise<Continuable<T>> {
		return modify((await Promise.all(continuable)) as Continuable<T>, continuable.cursor)
	}
}
