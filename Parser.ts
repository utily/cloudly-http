import { bind } from "./bind"
import { Continuable } from "./Continuable"
import { FormData } from "./FormData"
import { Request } from "./Request"
import { Response } from "./Response"
import * as Search from "./Search"

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
	static add = bind(this.parser.add, this.parser)
	static parse = bind(this.parser.parse, this.parser)
	static extend = bind(this.parser.extend, this.parser)
	static is<T = any | Promise<any>>(value: any | Parser<T>): value is Parser<T> {
		return value instanceof Parser
	}
}

Parser.add(async message => ({ ...message, body: await message.body?.text() }), "text/plain", "text/html")
Parser.add(async message => {
	let result = { ...message, body: await message.body?.json() }
	if (
		Response.is(message) &&
		Array.isArray(result.body) &&
		Array.isArray(result.header.link) &&
		result.header.link.length == 2 &&
		result.header.link[1] == 'rel="next"'
	)
		result = { ...result, body: Continuable.create(result.body, result.header.link[0]) }
	return result
}, "application/json")
Parser.add(
	async message => ({ ...message, body: message.body && FormData.from(await message.body.formData()) }),
	"multipart/form-data"
)
Parser.add(
	async message => ({ ...message, body: message.body && Search.parse(await message.body.text()) }),
	"application/x-www-form-urlencoded"
)
