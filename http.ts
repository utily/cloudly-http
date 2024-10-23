import { Authorization } from "./Authorization"
import { Client } from "./Client"
import { Continuable } from "./Continuable"
import { fetch } from "./fetch"
import { FormData } from "./FormData"
import { Method } from "./Method"
import { Middleware } from "./Middleware"
import { Parser } from "./Parser"
import { Request } from "./Request"
import { Response } from "./Response"
import { Search } from "./Search"
import { Serializer } from "./Serializer"
import { Socket } from "./Socket"

Serializer.add(
	async message => ({ ...message, body: typeof message.body == "string" ? message.body : message.body.toString() }),
	"text/plain",
	"text/html",
	"application/jwt"
)
Serializer.add(
	async message =>
		Response.is(message) && Continuable.hasCursor(message.body)
			? {
					...message,
					header: {
						...message.header,
						link: [message.body.cursor, 'rel="next"'],
						accessControlExposeHeaders: ["link"].concat(message.header.accessControlAllowHeaders ?? []),
					},
					body: JSON.stringify([...message.body]),
			  }
			: { ...message, body: JSON.stringify(message.body) },
	"application/json"
)
Serializer.add(
	async message => ({ ...message, body: Search.stringify(message.body) }),
	"application/x-www-form-urlencoded"
)
Serializer.add(async message => {
	const body = message.body instanceof globalThis.FormData ? message.body : FormData.to(message.body)
	return Request.is(message)
		? {
				...message,
				header: (({ contentType, ...header }) => header)(message.header),
				body,
		  }
		: { ...message, body }
}, "multipart/form-data")

Parser.add(
	async message => ({ ...message, body: await message.body?.text() }),
	"text/plain",
	"text/html",
	"application/jwt"
)
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

export {
	Authorization,
	Client,
	Continuable,
	fetch,
	FormData,
	Method,
	Middleware,
	Parser,
	Request,
	Response,
	Search,
	Serializer,
	Socket,
}
