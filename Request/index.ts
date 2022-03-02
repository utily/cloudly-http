/// <reference lib="webworker.iterable" />
import * as Parser from "../Parser"
import { Method } from "../Method"
import { Header as RequestHeader } from "./Header"
import { Like as RequestLike } from "./Like"
import * as Serializer from "../Serializer"

export interface Request {
	readonly method: Method
	readonly url: URL
	readonly parameter: { readonly [key: string]: string }
	readonly search: { readonly [key: string]: string }
	readonly remote?: string
	readonly header: Readonly<RequestHeader>
	readonly body?: any | Promise<any>
}

export namespace Request {
	export function is(value: any | Request): value is Request {
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
	export async function to(request: RequestLike): Promise<globalThis.RequestInit & { url: string }> {
		const r = is(request) ? request : create(request)
		return {
			url: r.url.toString(),
			method: r.method,
			headers: RequestHeader.to(r.header) as Record<string, string>,
			body: ["GET", "HEAD"].some(v => v == r.method)
				? undefined
				: await Serializer.serialize(await r.body, r.header.contentType),
		}
	}
	export function from(request: globalThis.Request): Request {
		const url = new URL(request.url)
		return {
			method: Method.parse(request.method) ?? "GET",
			url,
			header: RequestHeader.from(request.headers),
			parameter: {},
			search: Object.fromEntries(url.searchParams.entries()),
			body: Parser.parse(request),
		}
	}
	export function create(request: string | RequestLike): Request {
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
		return result
	}
	export type Header = RequestHeader
	export namespace Header {
		export const is = RequestHeader.is
		export const from = RequestHeader.from
		export const to = RequestHeader.to
	}
	export type Like = RequestLike
}
