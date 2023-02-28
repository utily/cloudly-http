import type { Request as CloudflareRequest } from "@cloudflare/workers-types"

const parsers: {
	[contentType: string]:
		| ((request: globalThis.Request | CloudflareRequest | globalThis.Response) => Promise<any>)
		| undefined
} = {}
export function add(
	parser: (request: globalThis.Request | globalThis.Response) => Promise<any>,
	...contentType: string[]
): void {
	contentType.forEach(t => (parsers[t] = parser))
}
export function parse(request: globalThis.Request | CloudflareRequest | globalThis.Response): Promise<any> {
	const contentType = request.headers.get("Content-Type")
	const type = contentType && contentType.split(";")
	const parser = parsers[type?.[0] ?? "plain/text"]
	return parser ? parser(request) : request.text()
}
