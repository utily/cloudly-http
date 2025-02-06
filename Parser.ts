import type { Request } from "./Request"
import type { Response } from "./Response"

type Parse<T> = (request: Request<Body> | Response<Body>) => Promise<Request<T> | Response<T>>

export class Parser<T = any | Promise<any>> {
	private parsers: {
		[contentType: string]: Parse<T> | undefined
	}
	constructor(extend?: Parser<T>) {
		this.parsers = extend ? { ...extend.parsers } : {}
	}
	add(parser: Parse<T>, ...contentType: string[]): void {
		contentType.forEach(t => (this.parsers[t] = parser))
	}
	async parse(request: Request<Body>): Promise<Request<T>>
	async parse(request: Response<Body>): Promise<Response<T>>
	async parse(request: Request<Body> | Response<Body>): Promise<Request<T> | Response<T>> {
		const contentType = request.header.contentType
		const type = contentType && contentType.split(";")
		const parser = type && this.parsers[type[0]]
		return parser ? parser(request) : (({ body, ...request }) => request)(request)
	}
	extend(): Parser {
		return new Parser(this)
	}
	private static parser = new Parser()
	static add = this.parser.add.bind(this.parser)
	static parse = this.parser.parse.bind(this.parser)
	static extend = this.parser.extend.bind(this.parser)
	static is<T = any | Promise<any>>(value: any | Parser<T>): value is Parser<T> {
		return value instanceof Parser
	}
}
