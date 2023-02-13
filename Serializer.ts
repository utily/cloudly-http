import { bind } from "./bind"
import { Continuable } from "./Continuable"
import { FormData } from "./FormData"
import { Request } from "./Request"
import { Response } from "./Response"
import * as Search from "./Search"

type Serialize = (
	message: Request<any> | Response<any>,
	contentType?: string
) => Promise<Request<BodyInit> | Response<BodyInit>>

export class Serializer {
	private serializers: {
		[contentType: string]: Serialize | undefined
	} = {}
	constructor(extend?: Serializer) {
		this.serializers = extend ? { ...extend.serializers } : {}
	}
	add(serialize: Serialize, ...contentType: string[]): void {
		contentType.forEach(t => (this.serializers[t] = serialize))
	}
	async serialize(request: Request): Promise<Request<BodyInit>>
	async serialize(response: Response): Promise<Response<BodyInit>>
	async serialize(message: Request<any> | Response<any>): Promise<Request<BodyInit> | Response<BodyInit>> {
		const serialize =
			"method" in message && ["GET", "HEAD"].some(v => v == message.method)
				? undefined
				: this.serializers[message.header.contentType?.split(";")[0] ?? ""]
		return serialize ? serialize(message) : (({ body, ...message }) => message)(message)
	}
	extend(): Serializer {
		return new Serializer(this)
	}
	private static serializer = new Serializer()
	static add = bind(this.serializer.add, this.serializer)
	static serialize = bind(this.serializer.serialize, this.serializer)
	static extend = bind(this.serializer.extend, this.serializer)
	static is(value: any | Serializer): value is Serializer {
		return value instanceof Serializer
	}
}

Serializer.add(
	async message => ({ ...message, body: typeof message.body == "string" ? message.body : message.body.toString() }),
	"text/plain",
	"text/html"
)
Serializer.add(
	async message =>
		Response.is(message) && Continuable.hasCursor(message.body)
			? {
					...message,
					header: { ...message.header, link: [message.body.cursor, 'rel="next"'] },
					body: JSON.stringify((({ cursor, ...data }) => data)(message.body)),
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
