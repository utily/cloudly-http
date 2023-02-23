import { Parser } from "./Parser"
import { Request } from "./Request"
import { Response } from "./Response"
import { Serializer } from "./Serializer"

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
	export function create<T = any, U = any>(preset: "identity"): Middleware<T, T, U, U>
	export function create<T = any, U = any>(preset: "client"): Middleware<T, Body, BodyInit, U>
	export function create<T = any, U = any>(preset: "server"): Middleware<T, Body, BodyInit, U>
	export function create<T = any, U = any>(
		parser: Parser<T> | undefined,
		serializer?: Serializer
	): Middleware<T, Body, U, U>
	export function create<T = any>(
		serializer: Serializer | undefined,
		parser?: Parser<T>
	): Middleware<T, T, BodyInit, any>
	export function create(
		processor?: "identity" | "client" | "server" | "headers" | Parser | Serializer,
		processorOut?: Parser | Serializer
	): Middleware {
		return processor == "identity"
			? async (request, next) => await next(request)
			: processor == "client"
			? async (request, next) => Parser.parse(await next(await Serializer.serialize(request)))
			: processor == "server"
			? async (request, next) => Serializer.serialize(await next(await Parser.parse(request)))
			: Parser.is(processor) && Serializer.is(processorOut)
			? async (request, next) => processorOut.serialize(await next(await processor.parse(request)))
			: Parser.is(processor) && processorOut == undefined
			? async (request, next) => await next(await processor.parse(request))
			: processor == undefined && Serializer.is(processorOut)
			? async (request, next) => processorOut.serialize(await next(request))
			: Serializer.is(processor) && Parser.is(processorOut)
			? async (request, next) => processorOut.parse(await next(await processor.serialize(request)))
			: Serializer.is(processor) && processorOut == undefined
			? async (request, next) => await next(await processor.serialize(request))
			: processor == undefined && Parser.is(processorOut)
			? async (request, next) => processorOut.parse(await next(request))
			: async (request, next) => await next(request)
	}
}
