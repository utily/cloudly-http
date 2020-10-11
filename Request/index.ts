import * as Parser from "../Parser"
import { Method as RequestMethod } from "./Method"
import { Header as RequestHeader } from "./Header"
import { Like as RequestLike } from "./Like"
import * as Stringifier from "../Serializer"

export interface Request {
	readonly method: RequestMethod
	readonly url: URL
	readonly parameter: { readonly [key: string]: string }
	readonly remote?: string
	readonly header: Readonly<RequestHeader>
	readonly body?: any | Promise<any>
}

export namespace Request {
	export function is(value: any | Request): value is Request {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["method", "url", "parameter", "remote", "header", "body"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || RequestHeader.is(value.header))
		)
	}
	export async function to(request: Request): Promise<globalThis.Request> {
		return new globalThis.Request(request.url.toString(), {
			method: request.method ?? "GET",
			headers: RequestHeader.to(request.header),
			body: await Stringifier.serialize(request),
		})
	}
	export function from(request: globalThis.Request): Request {
		return {
			method: RequestMethod.parse(request.method) ?? "GET",
			url: new URL(request.url),
			header: RequestHeader.from(request.headers),
			parameter: {},
			body: Parser.parse(request),
		}
	}
	export function create(request: string | RequestLike): Request {
		return typeof request == "string"
			? create({ url: request })
			: {
					method: RequestMethod.parse(request.method) ?? "GET",
					url: typeof request.url == "string" ? new URL(request.url) : request.url,
					parameter: request.parameter ?? {},
					remote: request.remote,
					header: request.header ?? {},
					body: request.body,
			  }
	}
	export type Header = RequestHeader
	export namespace Header {
		export const is = RequestHeader.is
		export const from = RequestHeader.from
		export const to = RequestHeader.to
	}
	export type Method = RequestMethod
	export namespace Method {
		export const is = RequestMethod.is
		export const parse = RequestMethod.parse
	}
	export type Like = RequestLike
}
