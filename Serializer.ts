import { bind } from "./bind"
import type { Request } from "./Request"
import type { Response } from "./Response"

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
			!("status" in message) && ["GET", "HEAD"].some(v => v == message.method)
				? undefined
				: this.serializers[message.header?.contentType?.split(";")[0] ?? ""]
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
