// eslint-disable-next-line @typescript-eslint/ban-types
export function bind<T extends Function>(f: T, me: any): T {
	return f.bind(me)
}
