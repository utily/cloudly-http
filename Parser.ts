const parsers: { [contentType: string]: ((body: Request) => Response) | undefined } = {}
export function add(contentType: string, parser: (body: Request) => Response): void {
	parsers[contentType] = parser
}
export function parse<T>(contentType?: string, body: any): T {
	const type = contentType.split(";")
	const parser = parsers[type[0]]
	return parser(body) as T
}
