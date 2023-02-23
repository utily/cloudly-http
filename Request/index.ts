/// <reference lib="webworker.iterable" />
import { ContentType } from "../ContentType"
import { Method } from "../Method"
import { Parser } from "../Parser"
import { Serializer } from "../Serializer"
import { Header as RequestHeader } from "./Header"
import { Like as RequestLike } from "./Like"

export interface Request<T = any | Promise<any>> {
	readonly method: Method
	readonly url: URL
	readonly parameter: { readonly [key: string]: string | undefined }
	readonly search: { readonly [key: string]: string | undefined }
	readonly remote?: string
	readonly header: Readonly<RequestHeader>
	readonly body?: T
}

export namespace Request {
	export function is<T = any | Promise<any>>(value: any | Request<T>): value is Request<T> {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key =>
				["method", "url", "parameter", "search", "remote", "header", "body"].some(k => k == key)
			) &&
			Method.is(value.method) &&
			value.url instanceof URL &&
			typeof value.parameter == "object" &&
			Object.entries(value.parameter).every(
				([parameter, value]) => typeof parameter == "string" && typeof value == "string"
			) &&
			typeof value.search == "object" &&
			Object.entries(value.search).every(([key, value]) => typeof key == "string" && typeof value == "string") &&
			(value.remote == undefined || typeof value.remote == "string") &&
			(value.header == undefined || RequestHeader.is(value.header))
		)
	}

	export async function to<T>(
		request: Request.Like<T>,
		serializer?: Serializer | "none"
	): Promise<globalThis.RequestInit & { url: string }> {
		const r = is(request) ? request : create(request)
		const result = serializer == "none" ? r : await (serializer ?? Serializer).serialize(r)
		return {
			url: result.url.toString(),
			method: result.method,
			headers: RequestHeader.to(result.header) as Record<string, string>,
			body: result.body,
		}
	}
	export async function from<T = any | Promise<any>>(
		request: globalThis.Request,
		parser?: Parser<T> | "none"
	): Promise<Request> {
		const url = new URL(request.url)
		const result = {
			method: Method.parse(request.method) ?? "GET",
			url,
			header: RequestHeader.from(request.headers),
			parameter: {},
			search: Object.fromEntries(url.searchParams.entries()),
			body: request,
		}
		return parser == "none" ? result : (parser ?? Parser).parse(result)
	}
	export function create(request: string): Request<string>
	export function create<T>(request: Request.Like<T>): Request<T>
	export function create(request: string | Request.Like): Request
	export function create(request: string | Request.Like): Request {
		let result: Request
		if (typeof request == "string")
			result = create({ url: request })
		else {
			const url = typeof request.url == "string" ? new URL(request.url) : request.url
			result = {
				method: Method.parse(request.method) ?? "GET",
				url,
				parameter: request.parameter ?? {},
				search: { ...request.search, ...Object.fromEntries(url.searchParams.entries()) },
				remote: request.remote,
				header: request.header ?? {},
				body: request.body,
			}
		}
		if (!result.header.contentType)
			result = { ...result, header: { ...result.header, contentType: ContentType.deduce(result.body) } }
		return result
	}
	export type Header = RequestHeader
	export namespace Header {
		export const is = RequestHeader.is
		export const from = RequestHeader.from
		export const to = RequestHeader.to
	}
	export type Like<T = any | Promise<any>> = RequestLike<T>
}
