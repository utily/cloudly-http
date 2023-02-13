import { Parser } from "../Parser"
import { Request } from "../Request"
import { Response } from "../Response"
import { Serializer } from "../Serializer"

export type Middleware<ResponseOut = any, ResponseIn = any, RequestOut = any, RequestIn = any> = (
	request: Request<RequestIn>,
	next: (request: Request<RequestOut>) => Promise<Response<ResponseIn>>
) => Promise<Response<ResponseOut>>

export namespace Middleware {
	export function is<ResponseOut = any, ResponseIn = any, RequestOut = any, RequestIn = any>(
		value: any | Middleware<ResponseOut, ResponseIn, RequestOut, RequestIn>
	): value is Middleware<ResponseOut, ResponseIn, RequestOut, RequestIn> {
		return value && typeof value == "function"
	}
	export function merge<ResponseOut, ResponseIn, RequestOut, RequestIn, ResponseT, RequestT>(
		before: Middleware<ResponseOut, ResponseT, RequestT, RequestIn>,
		after: Middleware<ResponseT, ResponseIn, RequestOut, RequestT>
	): Middleware<ResponseOut, ResponseIn, RequestOut, RequestIn> {
		return async (request, next) => before(request, r => after(r, next))
	}
	export function create<T = any, U = any>(preset: "default"): Middleware<T, Body, BodyInit, U>
	export function create<T = any, U = any>(parser: Parser<T>): Middleware<T, Body, U, U>
	export function create<T = any>(serializer: Serializer): Middleware<T, T, BodyInit, any>
	export function create(processor?: "default" | "headers" | Parser | Serializer): Middleware {
		return processor == "default"
			? async (request, next) => Parser.parse(await next(await Serializer.serialize(request)))
			: Parser.is(processor)
			? async (request, next) => processor.parse(await next(request))
			: Serializer.is(processor)
			? async (request, next) => await next(await processor.serialize(request))
			: async (request, next) => await next(request)
	}
}
