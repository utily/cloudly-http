const parsers: {
	[contentType: string]: ((request: globalThis.Request | globalThis.Response) => Promise<any>) | undefined
} = {}
export function add(
	parser: (request: globalThis.Request | globalThis.Response) => Promise<any>,
	...contentType: string[]
): void {
	contentType.forEach(t => (parsers[t] = parser))
}
export function parse(request: globalThis.Request | globalThis.Response, type?: string): Promise<any> {
	return (
		parsers[type ?? request.headers.get("Content-Type")?.split(";", 2)?.[0] ?? "plain/text"] ?? (r => r.arrayBuffer())
	)(request)
}
