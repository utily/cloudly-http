import * as api from "./api"

const parsers: { [contentType: string]: ((request: api.Request | api.Response) => Promise<any>) | undefined } = {}
export function add(parser: (request: api.Request | api.Response) => Promise<any>, ...contentType: string[]): void {
	contentType.forEach(t => (parsers[t] = parser))
}
export function parse(request: api.Request | api.Response): Promise<any> {
	const contentType = request.headers.get("Content-Type")
	const type = contentType && contentType.split(";")
	const parser = parsers[type?.[0] ?? "plain/text"]
	return parser ? parser(request) : request.text()
}
